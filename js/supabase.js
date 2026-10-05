// تهيئة اتصال Supabase وجعله متاحاً بشكل عام عبر window.supabaseClient

const SUPABASE_URL = "https://lbgehptsmniwfwnapsqi.supabase.co"; // ضع رابط مشروعك هنا
const SUPABASE_ANON_KEY = "sb_publishable_CQxZlz48Di1qTumXVWQQmw_SaF_R0rl"; // ضع مفتاح الـ Anon/Public هنا

// التحقق من تحميل مكتبة Supabase JS عبر الـ CDN
if (window.supabase) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("تمت تهيئة اتصال Supabase بنجاح!");
} else {
    console.error("مكتبة Supabase CDN لم يتم تحميلها في الصفحة!");
}
