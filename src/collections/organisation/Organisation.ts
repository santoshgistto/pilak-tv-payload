import { Access, CollectionAfterChangeHook, CollectionBeforeChangeHook, CollectionConfig, User } from "payload";


const addUser: CollectionBeforeChangeHook = ({ req, data }) => {
    return { ...data, user: req.user?.id }
}

const isAdminOrOrgUser: Access = async ({ req }) => {
    const user = req.user as User | undefined;
    if (!user) return false;
    if (user.role === 'admin') return true;

    return {
        user: {
            in: user.id
        }
    }
}

const afterChangeHook: CollectionAfterChangeHook = async ({ req, doc }) => {
    const user = req.user as User | undefined

    const fullUser = await req.payload.findByID({
        collection: "users",
        id: user?.id!
    })
    console.log("afterChangeHook===>", JSON.stringify(fullUser))
    if (fullUser && typeof fullUser === "object") {
       // const { org } = fullUser
        // await req.payload.update({
        //     collection: "users",
        //     id: fullUser.id,
        //     data: {
        //         org: doc.id
        //     }
        // })

    }

}
export const Organisation: CollectionConfig = {
    slug: "org",
    hooks: {
        beforeChange: [addUser],
        afterChange: [afterChangeHook]
    },
    admin: {
        useAsTitle: "name"
    },
    access: {
        read: ({ req }) => isAdminOrOrgUser({ req }),
        update: ({ req }) => isAdminOrOrgUser({ req }),
        delete: ({ req }) => isAdminOrOrgUser({ req })
    },

    fields: [
        {
            name: "name",
            label: "Organisation Name",
            type: "text",
            required: true,
            minLength: 3,
            maxLength: 40,
            unique: true
        },
        {
            name: "description",
            type: "textarea",
            label: "Description"
        },
        {
            name: "user",
            type: "relationship",
            relationTo: "users",
            required: true,
            hasMany: false,
            admin: {
                condition: ({req}) => false
                // condition : (data, siblingData, { user }) => {
                //     console.log("=====>", user?.role)
                //     return user?.role === 'admin';
                // }
            }
        }
    ]
}