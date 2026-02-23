// ── Supabase Client Initialization ────────────────────────────────────────
// This file must be loaded AFTER the Supabase CDN script and BEFORE all
// other app scripts.

const SUPABASE_URL = 'https://ojnxraxdynbhddfviweb.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qbnhyYXhkeW5iaGRkZnZpd2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0OTY4MTQsImV4cCI6MjA4NzA3MjgxNH0.cXzGKIaTOqk6LdJ2xN5gkhZbY2_ZWjJNEmjl0v0ObLg'
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
