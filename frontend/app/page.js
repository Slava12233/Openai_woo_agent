import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6 text-foreground">ברוכים הבאים למערכת ניהול סוכני WooCommerce</h1>
        <p className="text-xl mb-8 text-gray-600">
          פלטפורמה מתקדמת ליצירה וניהול סוכני AI עבור חנויות WooCommerce של הלקוחות שלך
        </p>
        <Link
          href="/login"
          className="bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          התחבר למערכת
        </Link>
      </div>
    </main>
  );
}
