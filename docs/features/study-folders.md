# Pastas de Estudo — Feature Overview

## Visão Geral

**Pastas de Estudo** é uma funcionalidade de organização de conhecimento que permite ao usuário criar coleções temáticas com os materiais que já existem em sua conta — resumos, transcrições, mapas mentais e flashcards — independente de qual aula ou gravação os gerou.

Mais do que um simples organizador, a pasta evolui conforme o usuário a alimenta: a partir de um determinado volume de conteúdo, o sistema analisa o tema da pasta e recomenda vídeos do YouTube diretamente relacionados, que podem ser processados dentro da plataforma para gerar novos materiais de estudo.

---

## O Problema que Resolve

Hoje, os materiais gerados na plataforma ficam vinculados individualmente a cada gravação ou áudio processado. Um estudante que acompanhou diversas aulas sobre um mesmo assunto — digamos, Cálculo Diferencial — precisa navegar entre múltiplas gravações para acessar os resumos, transcrições e flashcards daquele tema. Não existe um local único onde ele possa reunir tudo.

Além disso, o processo de aprendizagem raramente se limita ao que foi gravado em aula. O aluno frequentemente precisa buscar conteúdo complementar em outras fontes — e esse processo acontece fora da plataforma, de forma desconectada.

As Pastas de Estudo resolvem os dois problemas: organizam o que já existe e ajudam o usuário a descobrir o que ainda falta.

---

## Proposta de Valor

- **Organização por tema, não por gravação** — o usuário pensa em assuntos, não em arquivos.
- **Liberdade para misturar origens** — qualquer material de qualquer aula pode entrar em qualquer pasta.
- **Descoberta inteligente de conteúdo** — a pasta analisa o próprio material do usuário para sugerir vídeos relevantes.
- **Ciclo de aprendizagem completo** — o usuário parte do conteúdo que tem, descobre o que falta e gera novos materiais sem sair da plataforma.

---

## Experiência do Usuário

### Criando uma pasta

O usuário acessa a seção de Pastas de Estudo, clica em **Nova Pasta**, define um nome e uma descrição opcional para o tema que quer organizar. A pasta é criada vazia e pronta para receber conteúdo.

### Adicionando materiais

Dentro da pasta, o usuário pode adicionar qualquer material que já existe em sua conta: um resumo de uma aula de segunda-feira, uma transcrição de um podcast processado semana passada, um mapa mental de outra gravação completamente diferente. Não há restrição de origem — a única regra é que o material já deve existir na conta.

### Exemplo real

Uma pasta chamada **"Machine Learning – Conceitos Importantes"** poderia conter:

- O resumo de uma aula sobre redes neurais
- A transcrição completa de um podcast sobre aprendizado supervisionado
- O mapa mental gerado a partir de uma aula sobre algoritmos de clustering
- Os flashcards criados a partir de outra gravação sobre overfitting

Tudo reunido em um único lugar, mesmo vindo de fontes completamente diferentes.

### Navegando pelo conteúdo

Dentro da pasta, o usuário visualiza todos os seus materiais agrupados e pode acessar cada um individualmente — ler o resumo, revisar os flashcards, explorar o mapa mental — sem precisar saber de qual gravação ele veio.

---

## Fluxo Principal da Funcionalidade

```
1. Usuário cria uma pasta com nome (e descrição opcional)
2. Usuário navega pelos seus materiais existentes
3. Usuário adiciona os materiais que deseja à pasta
4. A pasta passa a funcionar como hub de conhecimento temático
5. [Ao atingir 5 itens] → Sub-feature de recomendação de vídeos é desbloqueada
```

---

## Regra para Desbloquear a Recomendação de Vídeos

A recomendação de vídeos do YouTube é desbloqueada automaticamente quando a pasta acumula **pelo menos 5 itens salvos**.

Esse limite existe por um motivo claro: quanto mais material o usuário adiciona, mais contexto o sistema tem para entender o tema real da pasta e fazer recomendações genuinamente relevantes. Com menos de 5 itens, o risco de recomendações imprecisas é alto.

Assim que o quinto item é adicionado, a pasta exibe a seção de **Vídeos Recomendados**.

---

## A Sub-feature: Recomendação de Vídeos

### Como funciona

Quando desbloqueada, o sistema analisa o conteúdo da pasta para entender o tema principal. Para isso, considera:

- O **nome** e a **descrição** da pasta
- O **tipo de materiais** armazenados (resumos, mapas mentais, flashcards, transcrições)
- O **conteúdo textual** desses materiais — o que está escrito nos resumos, o que aparece nos flashcards, os tópicos do mapa mental

Com base nesse contexto, o sistema sugere **5 vídeos do YouTube** relacionados ao tema identificado.

### O que o usuário pode fazer com os vídeos

Os vídeos recomendados não são apenas links externos. Eles se integram ao fluxo existente da plataforma: o usuário pode selecionar qualquer vídeo sugerido e processá-lo para gerar:

- Uma nova **transcrição**
- Um novo **resumo**
- Um novo **mapa mental**
- Novos **flashcards**

Os materiais gerados a partir do vídeo podem, em seguida, ser adicionados à mesma pasta — completando um ciclo de aprendizagem dentro da plataforma.

### Por que isso é relevante

O usuário não precisa mais sair da plataforma para buscar complementos sobre um tema. A descoberta acontece dentro do contexto do que ele já está estudando, com base no que ele mesmo organizou — o que tende a gerar recomendações muito mais precisas do que algoritmos genéricos.

---

## Responsabilidades do Frontend

- Tela de listagem de todas as pastas do usuário, com nome, descrição, quantidade de itens e indicador de recomendação desbloqueada
- Tela de criação e edição de pasta (nome + descrição)
- Tela interna da pasta com visualização dos materiais salvos, organizados por tipo
- Interface para adicionar materiais existentes à pasta (busca e seleção a partir dos materiais da conta)
- Interface para remover um material da pasta sem deletá-lo da conta
- Seção de Vídeos Recomendados, visível apenas quando a pasta tem 5 ou mais itens
- Card de cada vídeo recomendado com título, thumbnail, canal e botão para processar na plataforma
- Feedback visual indicando quantos itens faltam para desbloquear as recomendações

---

## Responsabilidades do Backend

- Criação, edição e exclusão de pastas
- Associação e remoção de materiais dentro de uma pasta (sem duplicar os dados — a pasta guarda referências, não cópias)
- Controle da regra de desbloqueio: verificar quando a pasta atinge 5 itens e marcar a recomendação como disponível
- Análise do conteúdo da pasta para identificar o tema principal (nome, descrição e conteúdo dos materiais)
- Busca de vídeos no YouTube relevantes ao tema identificado
- Retorno dos vídeos recomendados para o frontend
- Integração com o fluxo existente de processamento de áudio para permitir que vídeos recomendados gerem novos materiais

---

## Exemplos de Uso

### Estudante de Medicina

Cria a pasta **"Farmacologia – Antibióticos"** e adiciona:
- Resumo da aula de microbiologia sobre beta-lactâmicos
- Transcrição de uma aula sobre resistência bacteriana
- Flashcards sobre mecanismos de ação
- Mapa mental de uma revisão de Farmacologia clínica
- Resumo de uma aula sobre infecções hospitalares

Com 5 itens, o sistema recomenda vídeos sobre antibióticos, resistência antimicrobiana e farmacoterapia. O estudante processa um dos vídeos e adiciona os novos flashcards gerados à mesma pasta.

---

### Desenvolvedor aprendendo sobre IA

Cria a pasta **"Fundamentos de Machine Learning"** e vai adicionando materiais de diferentes aulas e podcasts ao longo de semanas. Quando atinge 5 itens, recebe recomendações de vídeos sobre temas que ainda não cobriu — como regularização e validação cruzada — e os processa na plataforma para gerar resumos e mapas mentais que entram direto na pasta.

---

## Benefícios para o Usuário

- **Menos tempo procurando** — todo o conteúdo sobre um tema está em um único lugar.
- **Estudo mais focado** — a pasta define o escopo, o usuário sabe exatamente o que tem e o que falta.
- **Aprendizagem contínua** — as recomendações de vídeo mantêm o ciclo de estudo ativo sem exigir que o usuário saia da plataforma.
- **Aproveitamento total do conteúdo gerado** — materiais que antes ficavam isolados por gravação passam a ser reutilizados em múltiplos contextos temáticos.
- **Personalização real** — as recomendações são baseadas no próprio conteúdo do usuário, não em preferências genéricas.

---

## Possíveis Extensões Futuras

- **Pastas colaborativas** — compartilhar uma pasta de estudo com outros usuários da plataforma.
- **Progresso de estudo** — marcar flashcards como revisados e acompanhar o avanço dentro da pasta.
- **Exportação da pasta** — gerar um PDF consolidado com todos os materiais da pasta.
- **Reordenação manual** — o usuário define a sequência lógica de leitura dos materiais.
- **Tags e filtros** — filtrar os materiais de uma pasta por tipo ou data de criação.
- **Pastas sugeridas automaticamente** — o sistema identifica materiais com temas similares na conta do usuário e sugere a criação de uma pasta.
- **Chat com a pasta** — perguntar algo sobre o tema e o sistema responde baseado em todos os materiais salvos na pasta.
