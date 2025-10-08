import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Mail, 
  Shield, 
  Database, 
  Bell,
  FileText,
  Calendar,
  DollarSign,
  Download,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';

const systemSettingsSchema = z.object({
  // Configurações gerais
  nomeEmpresa: z.string().min(2, 'Nome da empresa é obrigatório'),
  emailEmpresa: z.string().email('Email inválido'),
  telefoneEmpresa: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  enderecoEmpresa: z.string().min(5, 'Endereço é obrigatório'),
  
  // Configurações de email
  smtpHost: z.string().min(1, 'Host SMTP é obrigatório'),
  smtpPort: z.number().min(1, 'Porta SMTP é obrigatória'),
  smtpUser: z.string().min(1, 'Usuário SMTP é obrigatório'),
  smtpPassword: z.string().min(1, 'Senha SMTP é obrigatória'),
  smtpSecure: z.boolean(),
  
  // Configurações de segurança
  senhaMinLength: z.number().min(6, 'Mínimo de 6 caracteres'),
  senhaRequireSpecial: z.boolean(),
  senhaRequireNumber: z.boolean(),
  senhaRequireUpper: z.boolean(),
  sessionTimeout: z.number().min(15, 'Mínimo de 15 minutos'),
  maxLoginAttempts: z.number().min(3, 'Mínimo de 3 tentativas'),
  
  // Configurações de notificações
  notificarNovoContrato: z.boolean(),
  notificarVencimentoContrato: z.boolean(),
  notificarPagamentoPendente: z.boolean(),
  notificarEventoProximo: z.boolean(),
  diasAntesVencimento: z.number().min(1, 'Mínimo de 1 dia'),
  diasAntesEvento: z.number().min(1, 'Mínimo de 1 dia'),
  
  // Configurações financeiras
  moedaPadrao: z.string().min(1, 'Moeda padrão é obrigatória'),
  formatoData: z.string().min(1, 'Formato de data é obrigatório'),
  formatoHora: z.string().min(1, 'Formato de hora é obrigatório'),
  
  // Configurações de backup
  backupAutomatico: z.boolean(),
  frequenciaBackup: z.string().min(1, 'Frequência de backup é obrigatória'),
  manterBackups: z.number().min(1, 'Mínimo de 1 backup'),
});

type SystemSettingsData = z.infer<typeof systemSettingsSchema>;

export function SystemSettings() {
  const [loading, setLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [systemInfo, setSystemInfo] = useState({
    version: '1.0.0',
    database: 'PostgreSQL 15.0',
    uptime: '7 dias, 14 horas',
    storage: '2.3 GB / 10 GB',
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SystemSettingsData>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      // Configurações gerais
      nomeEmpresa: 'Chevals Eventos',
      emailEmpresa: 'contato@chevals.com.br',
      telefoneEmpresa: '(11) 99999-9999',
      enderecoEmpresa: 'Rua das Flores, 123 - São Paulo, SP',
      
      // Configurações de email
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: 'sistema@chevals.com.br',
      smtpPassword: '',
      smtpSecure: true,
      
      // Configurações de segurança
      senhaMinLength: 8,
      senhaRequireSpecial: true,
      senhaRequireNumber: true,
      senhaRequireUpper: true,
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      
      // Configurações de notificações
      notificarNovoContrato: true,
      notificarVencimentoContrato: true,
      notificarPagamentoPendente: true,
      notificarEventoProximo: true,
      diasAntesVencimento: 7,
      diasAntesEvento: 3,
      
      // Configurações financeiras
      moedaPadrao: 'BRL',
      formatoData: 'DD/MM/YYYY',
      formatoHora: 'HH:mm',
      
      // Configurações de backup
      backupAutomatico: true,
      frequenciaBackup: 'diario',
      manterBackups: 30,
    },
  });

  useEffect(() => {
    // Carregar configurações do sistema
    loadSystemSettings();
  }, []);

  const loadSystemSettings = async () => {
    try {
      setLoading(true);
      // Aqui você carregaria as configurações do Supabase
      // const { data } = await supabase.from('system_settings').select('*').single();
      // if (data) {
      //   Object.keys(data).forEach(key => {
      //     setValue(key as keyof SystemSettingsData, data[key]);
      //   });
      // }
      
      // Simular carregamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastBackup('2024-01-15 03:00:00');
    } catch (error) {
      toast.error('Erro ao carregar configurações do sistema');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: SystemSettingsData) => {
    try {
      setLoading(true);
      
      // Aqui você salvaria as configurações no Supabase
      // await supabase.from('system_settings').upsert(data);
      
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleBackupNow = async () => {
    try {
      setLoading(true);
      
      // Aqui você executaria o backup
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setLastBackup(new Date().toLocaleString('pt-BR'));
      toast.success('Backup realizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao realizar backup');
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      setLoading(true);
      
      // Aqui você testaria o envio de email
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Email de teste enviado com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar email de teste');
    } finally {
      setLoading(false);
    }
  };

  const watchBackupAutomatico = watch('backupAutomatico');
  const watchSmtpSecure = watch('smtpSecure');

  return (
    <div className="space-y-6">
      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Informações do Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">v{systemInfo.version}</div>
              <div className="text-sm text-gray-600">Versão</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-semibold">{systemInfo.database}</div>
              <div className="text-sm text-gray-600">Banco de Dados</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-semibold">{systemInfo.uptime}</div>
              <div className="text-sm text-gray-600">Tempo Online</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-semibold">{systemInfo.storage}</div>
              <div className="text-sm text-gray-600">Armazenamento</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Configurações Gerais</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nomeEmpresa">Nome da Empresa *</Label>
                <Input
                  id="nomeEmpresa"
                  {...register('nomeEmpresa')}
                  placeholder="Nome da empresa"
                />
                {errors.nomeEmpresa && (
                  <p className="text-sm text-red-600">{errors.nomeEmpresa.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailEmpresa">Email da Empresa *</Label>
                <Input
                  id="emailEmpresa"
                  type="email"
                  {...register('emailEmpresa')}
                  placeholder="contato@empresa.com"
                />
                {errors.emailEmpresa && (
                  <p className="text-sm text-red-600">{errors.emailEmpresa.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefoneEmpresa">Telefone da Empresa *</Label>
                <Input
                  id="telefoneEmpresa"
                  {...register('telefoneEmpresa')}
                  placeholder="(11) 99999-9999"
                />
                {errors.telefoneEmpresa && (
                  <p className="text-sm text-red-600">{errors.telefoneEmpresa.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="moedaPadrao">Moeda Padrão *</Label>
                <Input
                  id="moedaPadrao"
                  {...register('moedaPadrao')}
                  placeholder="BRL"
                />
                {errors.moedaPadrao && (
                  <p className="text-sm text-red-600">{errors.moedaPadrao.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="enderecoEmpresa">Endereço da Empresa *</Label>
              <Textarea
                id="enderecoEmpresa"
                {...register('enderecoEmpresa')}
                placeholder="Endereço completo da empresa"
                rows={2}
              />
              {errors.enderecoEmpresa && (
                <p className="text-sm text-red-600">{errors.enderecoEmpresa.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Configurações de Email</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestEmail}
                disabled={loading}
              >
                Testar Email
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">Host SMTP *</Label>
                <Input
                  id="smtpHost"
                  {...register('smtpHost')}
                  placeholder="smtp.gmail.com"
                />
                {errors.smtpHost && (
                  <p className="text-sm text-red-600">{errors.smtpHost.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPort">Porta SMTP *</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  {...register('smtpPort', { valueAsNumber: true })}
                  placeholder="587"
                />
                {errors.smtpPort && (
                  <p className="text-sm text-red-600">{errors.smtpPort.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpUser">Usuário SMTP *</Label>
                <Input
                  id="smtpUser"
                  {...register('smtpUser')}
                  placeholder="usuario@gmail.com"
                />
                {errors.smtpUser && (
                  <p className="text-sm text-red-600">{errors.smtpUser.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPassword">Senha SMTP *</Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  {...register('smtpPassword')}
                  placeholder="••••••••"
                />
                {errors.smtpPassword && (
                  <p className="text-sm text-red-600">{errors.smtpPassword.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="smtpSecure"
                checked={watchSmtpSecure}
                onCheckedChange={(checked) => setValue('smtpSecure', checked)}
              />
              <Label htmlFor="smtpSecure">Usar conexão segura (TLS/SSL)</Label>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Configurações de Segurança</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senhaMinLength">Tamanho Mínimo da Senha *</Label>
                <Input
                  id="senhaMinLength"
                  type="number"
                  {...register('senhaMinLength', { valueAsNumber: true })}
                  min="6"
                  max="20"
                />
                {errors.senhaMinLength && (
                  <p className="text-sm text-red-600">{errors.senhaMinLength.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Timeout da Sessão (min) *</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  {...register('sessionTimeout', { valueAsNumber: true })}
                  min="15"
                  max="480"
                />
                {errors.sessionTimeout && (
                  <p className="text-sm text-red-600">{errors.sessionTimeout.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Máx. Tentativas de Login *</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  {...register('maxLoginAttempts', { valueAsNumber: true })}
                  min="3"
                  max="10"
                />
                {errors.maxLoginAttempts && (
                  <p className="text-sm text-red-600">{errors.maxLoginAttempts.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Requisitos de Senha</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="senhaRequireSpecial"
                    {...register('senhaRequireSpecial')}
                  />
                  <Label htmlFor="senhaRequireSpecial">Caracteres especiais</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="senhaRequireNumber"
                    {...register('senhaRequireNumber')}
                  />
                  <Label htmlFor="senhaRequireNumber">Números</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="senhaRequireUpper"
                    {...register('senhaRequireUpper')}
                  />
                  <Label htmlFor="senhaRequireUpper">Maiúsculas</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Configurações de Notificações</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>Tipos de Notificação</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notificarNovoContrato"
                      {...register('notificarNovoContrato')}
                    />
                    <Label htmlFor="notificarNovoContrato">Novos contratos</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notificarVencimentoContrato"
                      {...register('notificarVencimentoContrato')}
                    />
                    <Label htmlFor="notificarVencimentoContrato">Vencimento de contratos</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notificarPagamentoPendente"
                      {...register('notificarPagamentoPendente')}
                    />
                    <Label htmlFor="notificarPagamentoPendente">Pagamentos pendentes</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notificarEventoProximo"
                      {...register('notificarEventoProximo')}
                    />
                    <Label htmlFor="notificarEventoProximo">Eventos próximos</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Antecedência das Notificações</Label>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="diasAntesVencimento">Dias antes do vencimento *</Label>
                    <Input
                      id="diasAntesVencimento"
                      type="number"
                      {...register('diasAntesVencimento', { valueAsNumber: true })}
                      min="1"
                      max="30"
                    />
                    {errors.diasAntesVencimento && (
                      <p className="text-sm text-red-600">{errors.diasAntesVencimento.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diasAntesEvento">Dias antes do evento *</Label>
                    <Input
                      id="diasAntesEvento"
                      type="number"
                      {...register('diasAntesEvento', { valueAsNumber: true })}
                      min="1"
                      max="30"
                    />
                    {errors.diasAntesEvento && (
                      <p className="text-sm text-red-600">{errors.diasAntesEvento.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Configurações de Backup</span>
              </div>
              <div className="flex items-center space-x-2">
                {lastBackup && (
                  <Badge variant="outline">
                    Último backup: {lastBackup}
                  </Badge>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleBackupNow}
                  disabled={loading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Backup Agora
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="backupAutomatico"
                checked={watchBackupAutomatico}
                onCheckedChange={(checked) => setValue('backupAutomatico', checked)}
              />
              <Label htmlFor="backupAutomatico">Backup automático</Label>
            </div>

            {watchBackupAutomatico && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                <div className="space-y-2">
                  <Label htmlFor="frequenciaBackup">Frequência do Backup *</Label>
                  <select
                    id="frequenciaBackup"
                    {...register('frequenciaBackup')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="diario">Diário</option>
                    <option value="semanal">Semanal</option>
                    <option value="mensal">Mensal</option>
                  </select>
                  {errors.frequenciaBackup && (
                    <p className="text-sm text-red-600">{errors.frequenciaBackup.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manterBackups">Manter Backups (dias) *</Label>
                  <Input
                    id="manterBackups"
                    type="number"
                    {...register('manterBackups', { valueAsNumber: true })}
                    min="1"
                    max="365"
                  />
                  {errors.manterBackups && (
                    <p className="text-sm text-red-600">{errors.manterBackups.message}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || loading}>
            {isSubmitting ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </form>
    </div>
  );
}