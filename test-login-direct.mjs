// Script para testar login direto com Supabase
// Execute com: node test-login-direct.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://irtnaxveqpjhcjyagbzc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydG5heHZlcXBqaGNqeWFnYnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMzkwODYsImV4cCI6MjA3NjYxNTA4Nn0.lcayGs3ktrT0iCTljiYNIS4lxIt3jGqmc1Tv__NeRR4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('🔍 Testando login direto com Supabase...');
  console.log('URL:', supabaseUrl);
  console.log('Email: admin@gestao-chevals.com');
  console.log('Password: admin123');
  console.log('---');

  try {
    // Teste 1: Verificar se conseguimos conectar com Supabase
    console.log('1. Testando conexão básica...');
    const { data: perfis, error: perfisError } = await supabase
      .from('perfis')
      .select('*');
    
    if (perfisError) {
      console.error('❌ Erro ao conectar com Supabase:', perfisError);
      return;
    }
    
    console.log('✅ Conexão OK. Perfis encontrados:', perfis.length);
    
    // Teste 2: Tentar fazer login
    console.log('2. Tentando fazer login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@gestao-chevals.com',
      password: 'admin123'
    });

    if (authError) {
      console.error('❌ Erro no login:', authError);
      console.error('Código:', authError.status);
      console.error('Mensagem:', authError.message);
      
      // Teste 3: Verificar se o usuário existe na tabela public.users
      console.log('3. Verificando usuário na tabela public.users...');
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'admin@gestao-chevals.com');
      
      if (usersError) {
        console.error('❌ Erro ao buscar usuário:', usersError);
      } else {
        console.log('👤 Usuários encontrados:', users);
      }
      
      return;
    }

    console.log('✅ Login realizado com sucesso!');
    console.log('Usuário:', authData.user?.email);
    console.log('ID:', authData.user?.id);
    
    // Teste 4: Verificar se conseguimos buscar dados do usuário
    console.log('4. Buscando dados do usuário logado...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (userError) {
      console.error('❌ Erro ao buscar dados do usuário:', userError);
    } else {
      console.log('✅ Dados do usuário:', userData);
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

testLogin();