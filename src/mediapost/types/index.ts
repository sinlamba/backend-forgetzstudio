export type platfrom = "Instagram" | "Threads" | "Tiktok" | "Facebook"
export type CreateMediaContainerProps = {
    videoUrl: string;
    scheduledAt: Date | null;
    caption: string;
    audioName: string;
};