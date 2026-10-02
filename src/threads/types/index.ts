type ProfileFields =
     | "id"
     | "username"
     | "name"
     | "threads_profile_picture_url"
     | "threads_biography";

interface containerResultType {
     id: string
}

export type {ProfileFields, containerResultType}