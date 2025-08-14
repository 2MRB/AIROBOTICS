import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gcfeqklskmwbiwjkdouu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjZmVxa2xza213Yml3amtkb3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMzA2NTQsImV4cCI6MjA3MDcwNjY1NH0.ZW9_4Xo9D5tK2mEHl2uMTdiCOUIUkuzp88YYAhFyr6Y';

export const supabase = createClient(supabaseUrl, supabaseKey);

// console.log('Supabase client initialized:', supabaseUrl);

// const { data, error } = await supabase
//   .from('users')
//   .select('*');

// console.log(data, error);