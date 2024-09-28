import { Access, CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionBeforeChangeHook, CollectionConfig, User } from "payload";
import { isAdmin } from "../access/CommonAcess";

const addUser: CollectionBeforeChangeHook = ({ req, data }) => {
    return { ...data, user: req.user?.id }
}

const isAdminOrHasAccess: Access = async ({ req }) => {
    const user = req.user as User | undefined
    if (!user) return false;
    if (user.role === 'admin') return true;
    return {
        user: {
            equals: req.user?.id
        }
    }
}

const syncScreeninUserDocument: CollectionAfterChangeHook = async ({ req, doc }) => {
    const fullUser = await req.payload.findByID({
        collection: "users",
        id: req.user?.id!
    })

    if (fullUser && typeof fullUser === "object") {
        const { screens } = fullUser

        const allScreenIds = [...(screens?.map((screen) => typeof screen === "object" ? screen.id : screen) || [])]
        const createScreenIds = allScreenIds.filter((id, index) => allScreenIds.indexOf(id) === index)
        const updateScreenIds = [...createScreenIds, doc.id]

        await req.payload.update({
            collection: "users",
            id: fullUser.id,
            data: {
                screens: updateScreenIds
            }
        })
    }
}

const deleteScreeninUserDocument: CollectionAfterDeleteHook = async ({ req, doc }) => {
    const fullUser = await req.payload.findByID({
        collection: "users",
        id: req.user?.id!
    })
    if (fullUser && typeof fullUser === 'object') {
        const { screens } = fullUser

        let allIds = [
            ...(screens?.map((screens) => typeof screens === 'object' ? screens.id : screens) || [])
        ]
        const index = allIds.findIndex(x => x === doc.id);
        if (index !== -1) {
            allIds.splice(index, 1)
            await req.payload.update({
                collection: "users",
                id: fullUser.id,
                data: {
                    screens: allIds
                }
            })
        }
    }
}

export const Screen: CollectionConfig = {
    slug: "screens",
    auth: {
        loginWithUsername: {
            allowEmailLogin: false,
            requireEmail: false
        },
        maxLoginAttempts: 10,
        verify: false, 
    },
    hooks: {
        beforeChange: [addUser],
        afterChange: [syncScreeninUserDocument],
        afterDelete: [deleteScreeninUserDocument]
    },
    access: {
        read: ({ req }) => isAdminOrHasAccess({ req }),
        update: ({ req }) => isAdminOrHasAccess({ req }),
        delete: ({ req }) => isAdminOrHasAccess({ req })
    },
    admin: {
        useAsTitle: "name", 
        hideAPIURL : true,

    },
    fields: [
        {
            name: "name",
            type: "text",
            required: true,
            maxLength: 30,
            minLength: 3,
            hasMany: false
        },
        {
            name: "description",
            type: "textarea",
            maxLength: 180,
        },
        {
            name: "location",
            label: "Screen Location",
            type: "text",
            maxLength: 180,
        },
        {
            name: "image",
            label: "Screen Image",
            type: "upload",
            relationTo: "media"
        },
        {
            name: "isEnabled",
            label: "Enable Screen",
            type: "checkbox",
            admin: {
                position: "sidebar"
            },
        },
        {
            name: "publication",
            label: "Publication",
            type: "relationship",
            relationTo: "publications", 
            hasMany: false,
            admin : {
                condition : ()=> false
            }
        },
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

    ]
}