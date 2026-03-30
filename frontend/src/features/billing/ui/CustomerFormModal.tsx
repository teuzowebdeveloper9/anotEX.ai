import { useState } from 'react'
import { User, Mail, Phone, CreditCard, X, Lock } from 'lucide-react'
import { Button } from '@/shared/ui/Button/Button'
import { Input } from '@/shared/ui/Input/Input'

interface CustomerData {
  name: string
  email: string
  cellphone: string
  taxId: string
}

interface CustomerFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (customer: CustomerData) => void
  isLoading: boolean
}

export function CustomerFormModal({ isOpen, onClose, onSubmit, isLoading }: CustomerFormModalProps) {
  const [formData, setFormData] = useState<CustomerData>({
    name: '',
    email: '',
    cellphone: '',
    taxId: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (field: keyof CustomerData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gradient-to-br from-[#0A2540]/60 via-[#0A2540]/40 to-[#38ABE4]/20 backdrop-blur-sm"
        onClick={onClose} 
      />
      
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="overflow-hidden rounded-3xl bg-white/95 shadow-2xl ring-1 ring-white/20">
          <div className="relative bg-gradient-to-r from-[#38ABE4] to-[#00C4CC] px-6 py-5">
            <button
              onClick={onClose}
              className="absolute right-3 top-3 rounded-full bg-white/20 p-1.5 text-white/80 transition-colors hover:bg-white/30 hover:text-white"
            >
              <X size={18} />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Dados para pagamento
                </h3>
                <p className="text-sm text-white/80">
                  Suas informações estão seguras
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm font-medium text-[#0A2540]">
                <User size={14} className="text-[#38ABE4]" />
                Nome completo
              </label>
              <Input
                value={formData.name}
                onChange={handleChange('name')}
                placeholder="Como aparece no documento"
                className="h-12"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm font-medium text-[#0A2540]">
                <Mail size={14} className="text-[#38ABE4]" />
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                placeholder="seu@email.com"
                className="h-12"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm font-medium text-[#0A2540]">
                <Phone size={14} className="text-[#38ABE4]" />
                Celular
              </label>
              <Input
                type="tel"
                value={formData.cellphone}
                onChange={handleChange('cellphone')}
                placeholder="(11) 99999-9999"
                className="h-12"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm font-medium text-[#0A2540]">
                <CreditCard size={14} className="text-[#38ABE4]" />
                CPF
              </label>
              <Input
                type="text"
                value={formData.taxId}
                onChange={handleChange('taxId')}
                placeholder="123.456.789-00"
                className="h-12"
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                className="h-12 flex-1 border-[#0A2540]/20 text-[#0A2540]" 
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                className="h-12 flex-1 bg-gradient-to-r from-[#38ABE4] to-[#00C4CC] hover:from-[#2d9ad4] hover:to-[#00b3bb]" 
                loading={isLoading}
              >
                Continuar
              </Button>
            </div>

            <p className="text-center text-xs text-[#0A2540]/50">
              Pagamento processado com segurança pela AbacatePay
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
