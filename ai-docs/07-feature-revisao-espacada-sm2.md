# Feature: Revisão Espaçada dos Flashcards (SM-2)

## Visão Geral

Sistema de repetição espaçada baseado no algoritmo **SM-2** (mesmo do Anki). Após revisar um flashcard, o aluno marca como **Difícil**, **Médio** ou **Fácil**. O sistema agenda a próxima revisão automaticamente — cards difíceis aparecem amanhã, fáceis aparecem daqui a dias/semanas.

Rotas:
- `/review` → fila de revisão do dia (todos os cards com `nextReview <= hoje`)
- `/dashboard` → widget "X cards para revisar hoje" com botão direto

---

## Algoritmo SM-2

### Interface e Lógica

```typescript
// Mapeamento de botões para qualidade SM-2
// Difícil → quality 2
// Médio   → quality 3
// Fácil   → quality 5

interface CardReview {
  interval: number;      // dias até próxima revisão
  repetitions: number;   // quantas vezes acertou consecutivamente
  easeFactor: number;    // multiplicador de intervalo (mínimo 1.3, começa em 2.5)
}

function calculateNextReview(card: CardReview, quality: 0 | 1 | 2 | 3 | 4 | 5): CardReview {
  // quality 0-2 = errou/difícil → reinicia sequência
  if (quality < 3) {
    return { ...card, interval: 1, repetitions: 0, easeFactor: card.easeFactor };
  }

  const newEase = Math.max(1.3, card.easeFactor + 0.1 - (5 - quality) * 0.18);

  const newInterval =
    card.repetitions === 0 ? 1 :
    card.repetitions === 1 ? 6 :
    Math.round(card.interval * newEase);

  return {
    interval: newInterval,
    repetitions: card.repetitions + 1,
    easeFactor: newEase,
  };
}
```

### Exemplos de progressão

| Revisão | Qualidade | Intervalo resultado |
|---------|-----------|---------------------|
| 1ª vez  | Fácil (5) | 1 dia               |
| 2ª vez  | Fácil (5) | 6 dias              |
| 3ª vez  | Fácil (5) | ~15 dias            |
| 3ª vez  | Médio (3) | ~9 dias             |
| qualquer | Difícil (2) | 1 dia (reset)    |

---

## Banco de Dados

### Migration

```sql
-- supabase/migrations/20260324000000_spaced_repetition.sql

-- 1. Adicionar review_data ao JSONB de cada flashcard dentro de study_materials
-- (review_data é armazenado junto ao conteúdo do flashcard no JSONB existente)
-- Estrutura do JSONB por item:
-- {
--   "id": "uuid",
--   "front": "...",
--   "back": "...",
--   "reviewData": {
--     "nextReview": "2026-03-25",
--     "interval": 1,
--     "repetitions": 0,
--     "easeFactor": 2.5
--   }
-- }

-- 2. Tabela de histórico de revisões (para analytics futuros)
CREATE TABLE flashcard_reviews (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flashcard_id TEXT        NOT NULL,   -- ID do item dentro do JSONB
  audio_id     UUID        NOT NULL REFERENCES audios(id) ON DELETE CASCADE,
  quality      SMALLINT    NOT NULL CHECK (quality BETWEEN 0 AND 5),
  reviewed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS obrigatório
ALTER TABLE flashcard_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_flashcard_reviews"
ON flashcard_reviews FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_flashcard_reviews"
ON flashcard_reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Índices para RLS e queries de analytics
CREATE INDEX idx_flashcard_reviews_user_id ON flashcard_reviews(user_id);
CREATE INDEX idx_flashcard_reviews_audio_id ON flashcard_reviews(audio_id);
CREATE INDEX idx_flashcard_reviews_reviewed_at ON flashcard_reviews(user_id, reviewed_at DESC);
```

### Como o `review_data` fica no JSONB

O campo `content` da tabela `study_materials` (tipo JSONB) contém os flashcards. Cada item do array `flashcards` ganha o campo `reviewData`:

```json
{
  "flashcards": [
    {
      "id": "a1b2c3",
      "front": "O que é mitose?",
      "back": "Divisão celular que gera duas células filhas geneticamente idênticas.",
      "reviewData": {
        "nextReview": "2026-03-25",
        "interval": 1,
        "repetitions": 0,
        "easeFactor": 2.5
      }
    }
  ]
}
```

---

## Backend — Estrutura de Módulos

```
backend/src/modules/spaced-repetition/
  domain/
    entities/
      flashcard-review.entity.ts      # Entidade pura (id, userId, flashcardId, audioId, quality, reviewedAt)
      card-review-data.entity.ts      # Value object: { interval, repetitions, easeFactor, nextReview }
    repositories/
      flashcard-review.repository.ts  # Interface IFlashcardReviewRepository
    use-cases/
      review-flashcard.use-case.ts    # Orquestra: busca card → calcula SM-2 → atualiza JSONB → salva histórico
      get-due-cards.use-case.ts       # Retorna todos os cards com nextReview <= hoje do usuário
  infrastructure/
    repositories/
      flashcard-review.repository.impl.ts   # Implementação Supabase (flashcard_reviews)
    helpers/
      sm2.helper.ts                   # Função pura calculateNextReview (testável isoladamente)
  application/
    dto/
      review-flashcard.dto.ts         # { audioId: string, flashcardId: string, quality: 0|1|2|3|4|5 }
      due-card-response.dto.ts        # { audioId, flashcardId, front, back, reviewData }
    services/
      spaced-repetition.service.ts    # Orquestra use-cases
  presentation/
    controllers/
      spaced-repetition.controller.ts # POST /review, GET /review/due
  spaced-repetition.module.ts
```

---

## Entidades de Domínio

```typescript
// card-review-data.entity.ts
export class CardReviewData {
  constructor(
    readonly interval: number,
    readonly repetitions: number,
    readonly easeFactor: number,
    readonly nextReview: string, // ISO date string: "2026-03-25"
  ) {}

  static initial(): CardReviewData {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return new CardReviewData(1, 0, 2.5, tomorrow.toISOString().split('T')[0]);
  }
}
```

```typescript
// flashcard-review.entity.ts
export class FlashcardReviewEntity {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly flashcardId: string,
    readonly audioId: string,
    readonly quality: number,
    readonly reviewedAt: Date,
  ) {}

  static create(params: {
    userId: string;
    flashcardId: string;
    audioId: string;
    quality: number;
  }): FlashcardReviewEntity {
    return new FlashcardReviewEntity(
      crypto.randomUUID(),
      params.userId,
      params.flashcardId,
      params.audioId,
      params.quality,
      new Date(),
    );
  }
}
```

---

## Interface do Repositório

```typescript
// flashcard-review.repository.ts
export interface IFlashcardReviewRepository {
  saveReview(review: FlashcardReviewEntity): Promise<void>;
  getReviewHistory(userId: string, flashcardId: string): Promise<FlashcardReviewEntity[]>;
}
```

---

## Helper SM-2

```typescript
// sm2.helper.ts
import { Injectable } from '@nestjs/common';
import { CardReviewData } from '../domain/entities/card-review-data.entity';

@Injectable()
export class Sm2Helper {
  calculate(current: CardReviewData, quality: 0 | 1 | 2 | 3 | 4 | 5): CardReviewData {
    let interval: number;
    let repetitions: number;

    if (quality < 3) {
      interval = 1;
      repetitions = 0;
    } else {
      const newEase = Math.max(1.3, current.easeFactor + 0.1 - (5 - quality) * 0.18);

      interval =
        current.repetitions === 0 ? 1 :
        current.repetitions === 1 ? 6 :
        Math.round(current.interval * newEase);

      repetitions = current.repetitions + 1;

      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + interval);

      return new CardReviewData(
        interval,
        repetitions,
        newEase,
        nextDate.toISOString().split('T')[0],
      );
    }

    const easeFactor = Math.max(1.3, current.easeFactor + 0.1 - (5 - quality) * 0.18);
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);

    return new CardReviewData(
      interval,
      repetitions,
      easeFactor,
      nextDate.toISOString().split('T')[0],
    );
  }

  isDue(reviewData: CardReviewData): boolean {
    const today = new Date().toISOString().split('T')[0];
    return reviewData.nextReview <= today;
  }
}
```

---

## Use Cases

### `review-flashcard.use-case.ts`

```typescript
@Injectable()
export class ReviewFlashcardUseCase {
  constructor(
    private readonly studyMaterialRepository: IStudyMaterialRepository, // já existe no módulo study-materials
    private readonly reviewRepository: IFlashcardReviewRepository,
    private readonly sm2: Sm2Helper,
  ) {}

  async execute(params: {
    userId: string;
    audioId: string;
    flashcardId: string;
    quality: 0 | 1 | 2 | 3 | 4 | 5;
  }): Promise<CardReviewData> {
    // 1. Buscar study_material do áudio (valida ownership via userId)
    const material = await this.studyMaterialRepository.findByAudioId(params.audioId, params.userId);
    if (!material) throw new NotFoundException('Material de estudo não encontrado');

    // 2. Localizar o flashcard no JSONB
    const flashcards: FlashcardItem[] = material.content.flashcards ?? [];
    const cardIndex = flashcards.findIndex(f => f.id === params.flashcardId);
    if (cardIndex === -1) throw new NotFoundException('Flashcard não encontrado');

    const card = flashcards[cardIndex];

    // 3. Calcular próxima revisão com SM-2
    const currentReviewData: CardReviewData = card.reviewData
      ? new CardReviewData(
          card.reviewData.interval,
          card.reviewData.repetitions,
          card.reviewData.easeFactor,
          card.reviewData.nextReview,
        )
      : CardReviewData.initial();

    const nextReviewData = this.sm2.calculate(currentReviewData, params.quality);

    // 4. Atualizar o JSONB com o novo reviewData
    flashcards[cardIndex] = { ...card, reviewData: nextReviewData };
    await this.studyMaterialRepository.updateFlashcards(params.audioId, params.userId, flashcards);

    // 5. Salvar no histórico
    const reviewEntity = FlashcardReviewEntity.create({
      userId: params.userId,
      flashcardId: params.flashcardId,
      audioId: params.audioId,
      quality: params.quality,
    });
    await this.reviewRepository.saveReview(reviewEntity);

    return nextReviewData;
  }
}
```

### `get-due-cards.use-case.ts`

```typescript
@Injectable()
export class GetDueCardsUseCase {
  constructor(
    private readonly studyMaterialRepository: IStudyMaterialRepository,
    private readonly sm2: Sm2Helper,
  ) {}

  async execute(userId: string): Promise<DueCardItem[]> {
    // Busca todos os study_materials do usuário
    const materials = await this.studyMaterialRepository.findAllByUserId(userId);

    const dueCards: DueCardItem[] = [];
    const today = new Date().toISOString().split('T')[0];

    for (const material of materials) {
      const flashcards: FlashcardItem[] = material.content.flashcards ?? [];

      for (const card of flashcards) {
        const isNew = !card.reviewData; // nunca revisado = sempre incluir
        const isDue = card.reviewData ? card.reviewData.nextReview <= today : true;

        if (isNew || isDue) {
          dueCards.push({
            audioId: material.audioId,
            audioTitle: material.title ?? 'Aula sem título',
            flashcardId: card.id,
            front: card.front,
            back: card.back,
            reviewData: card.reviewData ?? null,
          });
        }
      }
    }

    return dueCards;
  }
}
```

---

## Controller

```typescript
// spaced-repetition.controller.ts
@Controller('review')
@UseGuards(SupabaseAuthGuard)
export class SpacedRepetitionController {
  constructor(private readonly service: SpacedRepetitionService) {}

  // Retorna todos os cards devidos hoje
  @Get('due')
  async getDueCards(@Request() req): Promise<DueCardResponseDto[]> {
    return this.service.getDueCards(req.user.id);
  }

  // Registra revisão de um card e retorna os dados atualizados
  @Post()
  @HttpCode(200)
  async reviewCard(
    @Body() dto: ReviewFlashcardDto,
    @Request() req,
  ): Promise<CardReviewDataResponseDto> {
    return this.service.reviewCard(req.user.id, dto);
  }
}
```

### Endpoints expostos

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET`  | `/api/v1/review/due` | Retorna cards com `nextReview <= hoje` |
| `POST` | `/api/v1/review` | Registra revisão e atualiza schedule |

---

## DTOs

```typescript
// review-flashcard.dto.ts
import { IsUUID, IsString, IsIn } from 'class-validator';

export class ReviewFlashcardDto {
  @IsUUID()
  audioId: string;

  @IsString()
  flashcardId: string;

  @IsIn([0, 1, 2, 3, 4, 5])
  quality: 0 | 1 | 2 | 3 | 4 | 5;
}
```

```typescript
// due-card-response.dto.ts
export class DueCardResponseDto {
  audioId: string;
  audioTitle: string;
  flashcardId: string;
  front: string;
  back: string;
  reviewData: {
    nextReview: string;
    interval: number;
    repetitions: number;
    easeFactor: number;
  } | null;
}
```

---

## Atualizar `IStudyMaterialRepository`

O repositório de study-materials precisa de dois métodos novos:

```typescript
// study-material.repository.ts (adicionar ao interface existente)
findAllByUserId(userId: string): Promise<StudyMaterialEntity[]>;
updateFlashcards(audioId: string, userId: string, flashcards: FlashcardItem[]): Promise<void>;
```

A implementação `StudyMaterialRepositoryImpl` faz um `UPDATE study_materials SET content = jsonb_set(content, '{flashcards}', $1) WHERE audio_id = $2 AND user_id = $3`.

---

## Frontend — Estrutura FSD

```
frontend/src/
  pages/
    ReviewPage/
      ui/ReviewPage.tsx               # Rota /review — mostra cards devidos hoje
      index.ts

  features/
    flashcards/
      review-flashcard/
        model/
          useSpacedRepetition.ts      # Lógica: busca due cards, chama POST /review, avança fila
        ui/
          ReviewCard.tsx              # Card com flip animation + botões Difícil/Médio/Fácil
          ReviewSummary.tsx           # Tela de conclusão ("Revisão concluída!")
        index.ts

  widgets/
    DueCardsWidget/
      ui/DueCardsWidget.tsx           # Widget do Dashboard: "X cards para revisar hoje"
      model/useDueCardsCount.ts       # TanStack Query GET /review/due (só o count)
      index.ts
```

---

## Hook — `useSpacedRepetition.ts`

```typescript
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/axios';
import { endpoints } from '@/shared/api/endpoints';
import type { DueCardResponseDto } from '@/entities/study-material/study-material.types';

export type ReviewQuality = 'hard' | 'medium' | 'easy';

const qualityMap: Record<ReviewQuality, 0 | 2 | 5> = {
  hard: 2,
  medium: 3,
  easy: 5,
};

export function useSpacedRepetition() {
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionResults, setSessionResults] = useState<ReviewQuality[]>([]);

  const { data: dueCards = [], isLoading } = useQuery<DueCardResponseDto[]>({
    queryKey: ['review', 'due'],
    queryFn: () => api.get(endpoints.review.due).then(r => r.data),
  });

  const reviewMutation = useMutation({
    mutationFn: (vars: { audioId: string; flashcardId: string; quality: number }) =>
      api.post(endpoints.review.submit, vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review', 'due'] });
    },
  });

  const currentCard = dueCards[currentIndex] ?? null;
  const isFinished = currentIndex >= dueCards.length;

  function flip() {
    setIsFlipped(true);
  }

  async function submitReview(quality: ReviewQuality) {
    if (!currentCard) return;

    await reviewMutation.mutateAsync({
      audioId: currentCard.audioId,
      flashcardId: currentCard.flashcardId,
      quality: qualityMap[quality],
    });

    setSessionResults(prev => [...prev, quality]);
    setIsFlipped(false);
    setCurrentIndex(prev => prev + 1);
  }

  return {
    currentCard,
    isFlipped,
    isFinished,
    isLoading,
    totalCards: dueCards.length,
    currentIndex,
    sessionResults,
    flip,
    submitReview,
    isPending: reviewMutation.isPending,
  };
}
```

---

## Componente — `ReviewCard.tsx`

```tsx
import { motion } from 'framer-motion';
import { Button } from '@/shared/ui';

interface ReviewCardProps {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip: () => void;
  onReview: (quality: 'hard' | 'medium' | 'easy') => void;
  isPending: boolean;
}

export function ReviewCard({ front, back, isFlipped, onFlip, onReview, isPending }: ReviewCardProps) {
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
      {/* Card com flip */}
      <div className="w-full h-64 perspective-1000 cursor-pointer" onClick={!isFlipped ? onFlip : undefined}>
        <motion.div
          className="relative w-full h-full"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Frente */}
          <div className="absolute inset-0 backface-hidden bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl flex items-center justify-center p-8">
            <p className="text-[var(--text-primary)] text-xl font-medium text-center">{front}</p>
            {!isFlipped && (
              <p className="absolute bottom-4 text-[var(--text-secondary)] text-sm">Clique para revelar</p>
            )}
          </div>

          {/* Verso */}
          <div
            className="absolute inset-0 backface-hidden bg-[var(--bg-elevated)] border border-[var(--accent)] rounded-2xl flex items-center justify-center p-8"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <p className="text-[var(--text-primary)] text-lg text-center">{back}</p>
          </div>
        </motion.div>
      </div>

      {/* Botões de avaliação — só aparecem após flip */}
      {isFlipped && (
        <motion.div
          className="flex gap-4 w-full"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => onReview('hard')}
            disabled={isPending}
          >
            Difícil
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => onReview('medium')}
            disabled={isPending}
          >
            Médio
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => onReview('easy')}
            disabled={isPending}
          >
            Fácil
          </Button>
        </motion.div>
      )}
    </div>
  );
}
```

---

## Componente — `ReviewSummary.tsx`

```tsx
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui';

interface ReviewSummaryProps {
  total: number;
  results: Array<'hard' | 'medium' | 'easy'>;
}

export function ReviewSummary({ total, results }: ReviewSummaryProps) {
  const easy = results.filter(r => r === 'easy').length;
  const medium = results.filter(r => r === 'medium').length;
  const hard = results.filter(r => r === 'hard').length;

  return (
    <div className="flex flex-col items-center gap-8 py-16 text-center">
      <CheckCircle className="w-16 h-16 text-[var(--accent)]" />
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Revisão concluída!</h2>
        <p className="text-[var(--text-secondary)] mt-2">{total} cards revisados</p>
      </div>
      <div className="flex gap-6">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-[var(--danger)]">{hard}</span>
          <span className="text-sm text-[var(--text-secondary)]">Difícil</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-[var(--text-primary)]">{medium}</span>
          <span className="text-sm text-[var(--text-secondary)]">Médio</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-[var(--accent)]">{easy}</span>
          <span className="text-sm text-[var(--text-secondary)]">Fácil</span>
        </div>
      </div>
      <Link to="/dashboard">
        <Button variant="primary">Voltar ao Dashboard</Button>
      </Link>
    </div>
  );
}
```

---

## Página — `ReviewPage.tsx`

```tsx
import { useSpacedRepetition } from '@/features/flashcards/review-flashcard/model/useSpacedRepetition';
import { ReviewCard } from '@/features/flashcards/review-flashcard/ui/ReviewCard';
import { ReviewSummary } from '@/features/flashcards/review-flashcard/ui/ReviewSummary';
import { Skeleton } from '@/shared/ui';

export function ReviewPage() {
  const {
    currentCard,
    isFlipped,
    isFinished,
    isLoading,
    totalCards,
    currentIndex,
    sessionResults,
    flip,
    submitReview,
    isPending,
  } = useSpacedRepetition();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 px-4">
        <Skeleton className="h-64 w-full max-w-2xl rounded-2xl" />
        <Skeleton className="h-12 w-full max-w-2xl rounded-xl" />
      </div>
    );
  }

  if (totalCards === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <p className="text-[var(--text-primary)] text-xl font-semibold">Nenhum card para revisar hoje</p>
        <p className="text-[var(--text-secondary)] mt-2">Volte amanhã ou adicione mais conteúdo.</p>
      </div>
    );
  }

  if (isFinished) {
    return <ReviewSummary total={totalCards} results={sessionResults} />;
  }

  return (
    <div className="flex flex-col px-4 py-8 min-h-screen bg-[var(--bg-base)]">
      {/* Progresso */}
      <div className="w-full max-w-2xl mx-auto mb-8">
        <div className="flex justify-between text-sm text-[var(--text-secondary)] mb-2">
          <span>{currentIndex + 1} / {totalCards}</span>
          <span className="truncate max-w-xs">{currentCard?.audioTitle}</span>
        </div>
        <div className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--accent)] rounded-full transition-all duration-300"
            style={{ width: `${(currentIndex / totalCards) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <ReviewCard
        front={currentCard!.front}
        back={currentCard!.back}
        isFlipped={isFlipped}
        onFlip={flip}
        onReview={submitReview}
        isPending={isPending}
      />
    </div>
  );
}
```

---

## Widget do Dashboard — `DueCardsWidget.tsx`

```tsx
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Brain } from 'lucide-react';
import { Button } from '@/shared/ui';
import { api } from '@/shared/api/axios';
import { endpoints } from '@/shared/api/endpoints';

export function DueCardsWidget() {
  const { data: dueCards = [], isLoading } = useQuery({
    queryKey: ['review', 'due'],
    queryFn: () => api.get(endpoints.review.due).then(r => r.data),
    staleTime: 5 * 60 * 1000, // 5 min — não precisa de polling agressivo
  });

  const count = dueCards.length;

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-[var(--accent)]/10 rounded-xl">
          <Brain className="w-6 h-6 text-[var(--accent)]" />
        </div>
        <div>
          <p className="text-[var(--text-secondary)] text-sm">Para revisar hoje</p>
          {isLoading ? (
            <div className="h-7 w-12 bg-[var(--bg-surface)] rounded animate-pulse mt-1" />
          ) : (
            <p className="text-[var(--text-primary)] text-2xl font-bold">{count}</p>
          )}
        </div>
      </div>
      {!isLoading && count > 0 && (
        <Link to="/review">
          <Button variant="primary" size="sm">Revisar agora</Button>
        </Link>
      )}
    </div>
  );
}
```

---

## Endpoints — Atualizar `shared/api/endpoints.ts`

```typescript
// Adicionar ao objeto endpoints existente:
review: {
  due: '/review/due',
  submit: '/review',
},
```

---

## Navegação — Rota e Router

```tsx
// app/router.tsx — adicionar:
<Route path="/review" element={<ProtectedRoute><ReviewPage /></ProtectedRoute>} />
```

```tsx
// widgets/Sidebar ou Navbar — adicionar link:
<NavLink to="/review">
  <Brain className="w-5 h-5" />
  Revisão
</NavLink>
```

---

## Testes

### Backend

#### `sm2.helper.spec.ts`

```typescript
describe('Sm2Helper', () => {
  let helper: Sm2Helper;

  beforeEach(() => {
    helper = new Sm2Helper();
  });

  describe('calculate', () => {
    it('deve reiniciar o intervalo para 1 dia quando quality < 3', () => {
      const card = new CardReviewData(10, 3, 2.5, '2026-03-20');
      const result = helper.calculate(card, 2);
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(0);
    });

    it('deve retornar interval 1 na primeira repetição bem-sucedida', () => {
      const card = new CardReviewData(1, 0, 2.5, '2026-03-20');
      const result = helper.calculate(card, 5);
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);
    });

    it('deve retornar interval 6 na segunda repetição bem-sucedida', () => {
      const card = new CardReviewData(1, 1, 2.5, '2026-03-20');
      const result = helper.calculate(card, 5);
      expect(result.interval).toBe(6);
      expect(result.repetitions).toBe(2);
    });

    it('deve aumentar o easeFactor com quality alta', () => {
      const card = new CardReviewData(6, 2, 2.5, '2026-03-20');
      const result = helper.calculate(card, 5);
      expect(result.easeFactor).toBeGreaterThan(2.5);
    });

    it('deve diminuir o easeFactor com quality baixa (mas >= 3)', () => {
      const card = new CardReviewData(6, 2, 2.5, '2026-03-20');
      const result = helper.calculate(card, 3);
      expect(result.easeFactor).toBeLessThan(2.5);
    });

    it('não deve deixar easeFactor cair abaixo de 1.3', () => {
      const card = new CardReviewData(1, 0, 1.3, '2026-03-20');
      const result = helper.calculate(card, 3);
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('deve setar nextReview corretamente com base no interval calculado', () => {
      const card = new CardReviewData(1, 1, 2.5, '2026-03-20');
      const result = helper.calculate(card, 5); // interval = 6
      const expected = new Date();
      expected.setDate(expected.getDate() + 6);
      expect(result.nextReview).toBe(expected.toISOString().split('T')[0]);
    });
  });

  describe('isDue', () => {
    it('deve retornar true se nextReview é hoje ou anterior', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const card = new CardReviewData(1, 0, 2.5, yesterday.toISOString().split('T')[0]);
      expect(helper.isDue(card)).toBe(true);
    });

    it('deve retornar false se nextReview é no futuro', () => {
      const future = new Date();
      future.setDate(future.getDate() + 5);
      const card = new CardReviewData(5, 2, 2.5, future.toISOString().split('T')[0]);
      expect(helper.isDue(card)).toBe(false);
    });
  });
});
```

#### `review-flashcard.use-case.spec.ts`

```typescript
describe('ReviewFlashcardUseCase', () => {
  describe('execute', () => {
    it('deve lançar NotFoundException se study_material não existir');
    it('deve lançar NotFoundException se flashcardId não existir no JSONB');
    it('deve calcular reviewData via SM-2 e atualizar o JSONB');
    it('deve salvar o evento no histórico flashcard_reviews');
    it('deve usar CardReviewData.initial() se o card nunca foi revisado');
  });
});
```

#### `get-due-cards.use-case.spec.ts`

```typescript
describe('GetDueCardsUseCase', () => {
  describe('execute', () => {
    it('deve incluir cards com nextReview <= hoje');
    it('deve incluir cards sem reviewData (nunca revisados)');
    it('deve excluir cards com nextReview no futuro');
    it('deve retornar lista vazia se o usuário não tem materiais');
  });
});
```

#### `spaced-repetition.controller.spec.ts`

```typescript
describe('SpacedRepetitionController', () => {
  describe('GET /review/due', () => {
    it('deve retornar 200 com lista de due cards');
  });
  describe('POST /review', () => {
    it('deve retornar 200 com CardReviewData atualizado');
  });
});
```

### Frontend

#### `useSpacedRepetition.spec.ts`

```typescript
describe('useSpacedRepetition', () => {
  it('deve iniciar com currentIndex 0 e isFlipped false');
  it('deve setar isFlipped para true ao chamar flip()');
  it('deve avançar currentIndex após submitReview');
  it('deve setar isFinished=true quando currentIndex alcança totalCards');
  it('deve acumular sessionResults corretamente');
  it('deve chamar POST /review com audioId, flashcardId e quality corretos');
});
```

---

## Checklist de Implementação

### Backend
- [ ] Migration `20260324000000_spaced_repetition.sql` (tabela `flashcard_reviews` + RLS + índices)
- [ ] `CardReviewData` value object
- [ ] `FlashcardReviewEntity`
- [ ] `IFlashcardReviewRepository` interface
- [ ] `FlashcardReviewRepositoryImpl` (Supabase)
- [ ] `Sm2Helper` (função pura `calculate` + `isDue`)
- [ ] `ReviewFlashcardUseCase`
- [ ] `GetDueCardsUseCase`
- [ ] Adicionar `findAllByUserId` e `updateFlashcards` ao `IStudyMaterialRepository` e sua impl
- [ ] `SpacedRepetitionService`
- [ ] `SpacedRepetitionController` (GET /due + POST /)
- [ ] `SpacedRepetitionModule` + registrar em `AppModule`
- [ ] Testes unitários (Sm2Helper 100%, use-cases 100%, controller 80%)

### Frontend
- [ ] Adicionar `review.due` e `review.submit` ao `endpoints.ts`
- [ ] `useSpacedRepetition.ts` (hook principal com estado de sessão)
- [ ] `ReviewCard.tsx` (flip animation + botões Difícil/Médio/Fácil)
- [ ] `ReviewSummary.tsx` (tela de conclusão com stats)
- [ ] `ReviewPage.tsx` (composição + barra de progresso)
- [ ] `DueCardsWidget.tsx` (widget do Dashboard)
- [ ] `useDueCardsCount.ts` (TanStack Query para o widget)
- [ ] Rota `/review` no router
- [ ] Link "Revisão" na Sidebar/Navbar
- [ ] Widget `DueCardsWidget` no `DashboardPage`
- [ ] Testes do hook `useSpacedRepetition`

---

## Decisões de Design

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Armazenamento do `reviewData` | JSONB dentro de `study_materials` | Evita nova tabela; os flashcards já são JSONB — mantém os dados acoplados |
| Histórico separado | Tabela `flashcard_reviews` | Permite analytics futuros (taxa de acerto, curva de aprendizado) sem complexidade imediata |
| Qualidade → 3 opções | Difícil (2), Médio (3), Fácil (5) | SM-2 tem 0-5 mas 3 opções reduz friction cognitiva — Anki usa a mesma simplificação |
| Cards novos | Sempre incluídos na fila diária | Flashcard sem `reviewData` = ainda não visto = deve aparecer hoje |
| Flip antes de avaliar | Obrigatório | Força o aluno a tentar lembrar antes de ver a resposta (princípio do recall ativo) |
| Polling do widget | `staleTime: 5min`, sem `refetchInterval` | A fila de revisão não muda durante o dia a não ser que o usuário revise — não precisa polling agressivo |
