import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUserStore } from '@/stores/userStore';
import { toast } from 'sonner';
import type { User } from '@/stores/userStore';

const passwordResetSchema = z.object({
  newPassword: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

interface PasswordResetFormProps {
  user: User;
  onClose: () => void;
}

export function PasswordResetForm({ user, onClose }: PasswordResetFormProps) {
  const { resetUserPassword, loading } = useUserStore();
  const [showPasswords, setShowPasswords] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
  });

  const onSubmit = async (data: PasswordResetFormData) => {
    try {
      await resetUserPassword(user.id, data.newPassword);
      toast.success('Senha redefinida com sucesso! O usuário deve alterar a senha no próximo login.');
      onClose();
    } catch (error) {
      toast.error('Erro ao redefinir senha');
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    // Usar setValue não funciona aqui porque precisamos atualizar os inputs diretamente
    const newPasswordInput = document.getElementById('newPassword') as HTMLInputElement;
    const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement;
    
    if (newPasswordInput && confirmPasswordInput) {
      newPasswordInput.value = newPassword;
      confirmPasswordInput.value = newPassword;
      setShowPasswords(true);
      
      // Copiar para clipboard
      navigator.clipboard.writeText(newPassword).then(() => {
        toast.success('Senha gerada e copiada para a área de transferência!');
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Redefinir Senha</h3>
        <p className="text-gray-600 mt-1">
          Definindo nova senha para: <strong>{user.nome}</strong>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          O usuário será obrigado a alterar a senha no próximo login
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword">Nova Senha *</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPasswords ? 'text' : 'password'}
              {...register('newPassword')}
              placeholder="Digite a nova senha"
            />
          </div>
          {errors.newPassword && (
            <p className="text-sm text-red-600">{errors.newPassword.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showPasswords ? 'text' : 'password'}
              {...register('confirmPassword')}
              placeholder="Confirme a nova senha"
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleGeneratePassword}
            size="sm"
          >
            Gerar Senha Aleatória
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowPasswords(!showPasswords)}
            size="sm"
          >
            {showPasswords ? 'Ocultar' : 'Mostrar'} Senhas
          </Button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <h4 className="font-medium text-yellow-800 mb-1">Importante:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• A senha atual do usuário será invalidada</li>
            <li>• O usuário receberá um aviso para alterar a senha no próximo login</li>
            <li>• Certifique-se de comunicar a nova senha ao usuário de forma segura</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || loading}>
            {isSubmitting ? 'Redefinindo...' : 'Redefinir Senha'}
          </Button>
        </div>
      </form>
    </div>
  );
}