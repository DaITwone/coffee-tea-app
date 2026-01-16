import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://kbkypioxumccllycmbyt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtia3lwaW94dW1jY2xseWNtYnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTI3NTgsImV4cCI6MjA4MzE4ODc1OH0.TnLXJ5ZZrM_MfFc1nuCXVl1ufIFzpaIGIEOwiPxTFV8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);