// ── Supabase Client Initialization ────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ojnxraxdynbhddfviweb.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qbnhyYXhkeW5iaGRkZnZpd2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0OTY4MTQsImV4cCI6MjA4NzA3MjgxNH0.cXzGKIaTOqk6LdJ2xN5gkhZbY2_ZWjJNEmjl0v0ObLg'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
