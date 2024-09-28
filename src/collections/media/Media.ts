import { Access, CollectionBeforeChangeHook, CollectionConfig, User } from "payload";

const addUser :CollectionBeforeChangeHook = ({req, data})=>{
     return {...data, user:req.user?.id}
}

const isAdminOrHasAccess :Access = async ({req}) =>{
    const user = req.user as User | undefined
    if(!user) return false
    if(user.role === 'admin') return true;
    return {
        user:{
            equals : req.user?.id
        }
    }
}

export const Media: CollectionConfig = {
    slug: "media",
    hooks:{
        beforeChange : [
            addUser
        ]

    }, 
    admin: {
        hideAPIURL : true,
       // hidden: ({ user }) => user?.role !== 'admin'
    },
    access : {
        read : ({req}) =>  isAdminOrHasAccess({req}), 
        delete : ({req}) =>  isAdminOrHasAccess({req}), 
        update : ({req}) =>  isAdminOrHasAccess({req}), 
    }, 

    upload: {
        staticDir: "media",
        imageSizes: [
            {
                name: "thumbnail",
                width: 400,
                height: 300,
                position: "centre"
            },
            {
                name: "card",
                width: 768,
                height: 1024,
                position: "centre"
            },
            {
                name: "tablet",
                width: 1024,
                position: "centre"
            }
        ],
        mimeTypes: ["image/*"]
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
    ]
}