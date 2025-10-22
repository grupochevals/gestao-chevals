import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { User, Perfil } from '@/types';

const userFormSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  perfil_id: z.string().min(1, 'Selecione um perfil'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional().or(z.literal('')),
  ativo: z.boolean().default(true),
  primeiro_login: z.boolean().default(true),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  user: User | null;
  perfis: Perfil[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserForm({ user, perfis, onSuccess, onCancel }: UserFormProps) {
  const { toast } = useToast();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      nome: user?.nome || '',
      email: user?.email || '',
      perfil_id: user?.perfil_id?.toString() || '',
      password: '',
      ativo: user?.ativo ?? true,
      primeiro_login: user?.primeiro_login ?? true,
    },
  });

  const onSubmit = async (values: UserFormValues) => {
    try {
      if (user) {
        // Atualizar usuário existente
        const { error: updateError } = await supabase
          .from('users')
          .update({
            nome: values.nome,
            email: values.email,
            perfil_id: parseInt(values.perfil_id),
            ativo: values.ativo,
            primeiro_login: values.primeiro_login,
          })
          .eq('id', user.id);

        if (updateError) throw updateError;

        // Se forneceu nova senha, atualizar no auth
        if (values.password) {
          const { error: authError } = await supabase.auth.admin.updateUserById(
            user.id,
            { password: values.password }
          );
          if (authError) throw authError;
        }

        toast({
          title: 'Usuário atualizado',
          description: 'As informações do usuário foram atualizadas com sucesso.',
        });
      } else {
        // Criar novo usuário
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: values.email,
          password: values.password || generateRandomPassword(),
          email_confirm: true,
          user_metadata: {
            nome: values.nome,
          },
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('Erro ao criar usuário');

        // Criar registro na tabela users
        const { error: userError } = await supabase.from('users').insert({
          id: authData.user.id,
          nome: values.nome,
          email: values.email,
          perfil_id: parseInt(values.perfil_id),
          ativo: values.ativo,
          primeiro_login: values.primeiro_login,
        });

        if (userError) throw userError;

        toast({
          title: 'Usuário criado',
          description: 'O novo usuário foi criado com sucesso.',
        });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome completo</FormLabel>
              <FormControl>
                <Input placeholder="João da Silva" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="joao@example.com"
                  {...field}
                  disabled={!!user}
                />
              </FormControl>
              {user && (
                <FormDescription>
                  O email não pode ser alterado após a criação do usuário.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="perfil_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Perfil</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um perfil" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {perfis.map((perfil) => (
                    <SelectItem key={perfil.id} value={perfil.id.toString()}>
                      {perfil.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                O perfil define as permissões do usuário no sistema.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {user ? 'Nova senha (opcional)' : 'Senha'}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={user ? 'Deixe em branco para manter a atual' : '******'}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {user
                  ? 'Preencha apenas se desejar alterar a senha do usuário.'
                  : 'Senha deve ter no mínimo 6 caracteres.'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="ativo"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Usuário ativo</FormLabel>
                  <FormDescription>
                    Usuários inativos não podem acessar o sistema
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="primeiro_login"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Primeiro login</FormLabel>
                  <FormDescription>
                    Forçar troca de senha no próximo login
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? 'Salvando...'
              : user
              ? 'Atualizar'
              : 'Criar Usuário'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
