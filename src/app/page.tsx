import { SchoolTalkClient } from '@/components/school-talk-client';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-4xl space-y-8">
        <header className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground">
            SchoolTalk
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Streamline your communication with parents.
          </p>
        </header>
        <SchoolTalkClient />
      </div>
    </main>
  );
}
