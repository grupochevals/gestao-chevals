// Script para criar usuário admin via signup API do Supabase
// Execute com: node create-user-via-signup.mjs

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vbzcwgnujsqnrqfkchjn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiemN3Z251anNxbnJxZmtjaGpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1NTcxOTcsImV4cCI6MjA1MzEzMzE5N30.Ej8Ej-Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdminUser() {
  console.log('🔧 Criando usuário admin via signup...');
  
  try {
    // Primeiro, tentar fazer signup do usuário
    console.log('1. Tentando criar usuário via signup...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'admin@gestao-chevals.com',
      password: 'admin123',
      options: {
        emailRedirectTo: undefined, // Não redirecionar
        data: {
          nome: 'Administrador'
        }
      }
    });

    if (signUpError) {
      console.error('❌ Erro no signup:', signUpError);
      
      // Se o usuário já existe, tentar fazer login
      if (signUpError.message.includes('already registered')) {
        console.log('2. Usuário já existe, tentando fazer login...');
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'admin@gestao-chevals.com',
          password: 'admin123'
        });

        if (signInError) {
          console.error('❌ Erro no login:', signInError);
          return;
        }

        console.log('✅ Login realizado com sucesso!');
        console.log('Usuário:', signInData.user?.email);
        console.log('ID:', signInData.user?.id);
        
        // Verificar se o usuário existe na tabela public.users
        await checkAndCreatePublicUser(signInData.user);
        return;
      }
      
      return;
    }

    console.log('✅ Usuário criado via signup!');
    console.log('Usuário:', signUpData.user?.email);
    console.log('ID:', signUpData.user?.id);
    
    // Verificar se precisa confirmar email
    if (signUpData.user && !signUpData.user.email_confirmed_at) {
      console.log('⚠️  Email não confirmado. Você pode confirmar manualmente no Dashboard.');
    }
    
    // Criar entrada na tabela public.users
    await checkAndCreatePublicUser(signUpData.user);
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

async function checkAndCreatePublicUser(user) {
  if (!user) return;
  
  console.log('3. Verificando/criando entrada na tabela public.users...');
  
  try {
    // Verificar se o usuário já existe na tabela public.users
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar usuário:', checkError);
      return;
    }
    
    if (existingUser) {
      console.log('✅ Usuário já existe na tabela public.users');
      console.log('Dados:', existingUser);
      return;
    }
    
    // Criar entrada na tabela public.users
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        nome: 'Administrador',
        perfil_id: 1,
        ativo: true,
        primeiro_login: true
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Erro ao criar entrada na tabela public.users:', insertError);
      return;
    }
    
    console.log('✅ Entrada criada na tabela public.users:');
    console.log('Dados:', newUser);
    
  } catch (error) {
    console.error('❌ Erro ao gerenciar tabela public.users:', error);
  }
}

createAdminUser();