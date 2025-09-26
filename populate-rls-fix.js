// Script para popular o banco usando service key válida para contornar RLS
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://miwxirnutduprdyqngkh.supabase.co';
// Chave de serviço válida para contornar RLS
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pd3hpcm51dGR1cHJkeXFuZ2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NzQ5MTAsImV4cCI6MjA3NDI1MDkxMH0.sNX0dzpUuN2TVeay87nEs3aCYk74I_nHO_MSWBzw94o'