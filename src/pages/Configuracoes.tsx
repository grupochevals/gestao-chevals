import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Users, Shield, Database, Bell } from 'lucide-react';

export function Configuracoes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-2">
          Gerencie usuários, permissões e configurações do sistema
        </p>
      </div>

      {/* Configuration Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Usuários</CardTitle>
            </div>
            <CardDescription>
              Gerencie usuários do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">• Criar novos usuários</p>
              <p className="text-sm text-gray-600">• Editar perfis</p>
              <p className="text-sm text-gray-600">• Gerenciar status</p>
            </div>
            <Button className="w-full mt-4" variant="outline">
              Gerenciar Usuários
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Permissões</CardTitle>
            </div>
            <CardDescription>
              Configure grupos e permissões
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">• Criar grupos</p>
              <p className="text-sm text-gray-600">• Definir permissões</p>
              <p className="text-sm text-gray-600">• Atribuir usuários</p>
            </div>
            <Button className="w-full mt-4" variant="outline">
              Gerenciar Permissões
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Sistema</CardTitle>
            </div>
            <CardDescription>
              Configurações gerais do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">• Configurações gerais</p>
              <p className="text-sm text-gray-600">• Parâmetros do sistema</p>
              <p className="text-sm text-gray-600">• Logs e auditoria</p>
            </div>
            <Button className="w-full mt-4" variant="outline">
              Configurar Sistema
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg">Backup</CardTitle>
            </div>
            <CardDescription>
              Backup e restauração de dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">• Backup automático</p>
              <p className="text-sm text-gray-600">• Restaurar dados</p>
              <p className="text-sm text-gray-600">• Histórico de backups</p>
            </div>
            <Button className="w-full mt-4" variant="outline">
              Gerenciar Backup
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-red-600" />
              <CardTitle className="text-lg">Notificações</CardTitle>
            </div>
            <CardDescription>
              Configure alertas e notificações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">• Alertas por email</p>
              <p className="text-sm text-gray-600">• Notificações push</p>
              <p className="text-sm text-gray-600">• Configurar frequência</p>
            </div>
            <Button className="w-full mt-4" variant="outline">
              Configurar Alertas
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status do Sistema</CardTitle>
          <CardDescription>
            Informações sobre o estado atual do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">Online</div>
              <p className="text-sm text-green-700">Sistema operacional</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">99.9%</div>
              <p className="text-sm text-blue-700">Uptime</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">v1.0.0</div>
              <p className="text-sm text-purple-700">Versão atual</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}