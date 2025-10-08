// Script para testar a conexão com o Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Testando conexão com Supabase...');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'Não encontrada');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n1. Testando conexão básica...');
    const { data, error } = await supabase.from('perfis').select('*').limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão:', error.message);
    } else {
      console.log('✅ Conexão com banco estabelecida');
      console.log('Dados encontrados:', data);
    }

    console.log('\n2. Testando autenticação com credenciais admin...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@gestao-chevals.com',
      password: '123456'
    });

    if (authError) {
      console.error('❌ Erro na autenticação:', authError.message);
      console.error('Código do erro:', authError.status);
      console.error('Detalhes:', authError);
    } else {
      console.log('✅ Autenticação bem-sucedida');
      console.log('Usuário:', authData.user?.email);
      
      // Fazer logout
      await supabase.auth.signOut();
    }

    console.log('\n3. Verificando se usuário admin existe...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@gestao-chevals.com')
      .single();

    if (userError) {
      console.error('❌ Erro ao buscar usuário:', userError.message);
    } else {
      console.log('✅ Usuário admin encontrado:', userData);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testConnection();