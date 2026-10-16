import PublicPortal from '@/app/public-portal';
export default async function Page({ params }: {
    params: Promise<{
        token: string;
    }>;
}) { return <PublicPortal token={(await params).token}/>; }
