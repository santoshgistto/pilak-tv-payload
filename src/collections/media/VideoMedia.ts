import { CollectionBeforeChangeHook, CollectionConfig, User } from "payload";

const addUser: CollectionBeforeChangeHook = ({ req, data }) => {
    const user = req.user as User | null
    return { ...data, user: user?.id }
}

export const VideoMedia: CollectionConfig = {
    slug: "videoMedia",
    hooks: {
        beforeChange : [addUser]
    },
    fields: [
        {
            name: "user",
            type: "relationship",
            relationTo: "users",
            required: true,
            hasMany: false,
            admin: {
                condition: () => false
            }
        }
    ],
    upload: {
        staticDir: "videoMedia",
        mimeTypes: ["video/*"]
    },
}