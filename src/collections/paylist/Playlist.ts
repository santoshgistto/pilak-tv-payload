import { Access, Block, CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionBeforeChangeHook, CollectionConfig, User } from "payload";

const syncUser: CollectionAfterChangeHook = async ({ req, doc }) => {

    const fullUser = await req.payload.findByID({
        collection: "users",
        id: req.user?.id!
    })

    if (fullUser && typeof fullUser === 'object') {
        const { playlists } = fullUser

        const allIds = [
            ...(playlists?.map((playlist) => typeof playlist === 'object' ? playlist.id : playlist) || [])
        ]

        const createdPlaylistIds = allIds.filter((id, index) => allIds.indexOf(id) === index)
        const newPlaylists = [...createdPlaylistIds, doc.id]

        // console.log("syncUser :::", newPlaylists)

        await req.payload.update({
            collection: "users",
            id: fullUser.id,
            data: {
                playlists: newPlaylists
            }
        })

    }

}

const deletePlaylistInFromUser: CollectionAfterDeleteHook = async ({ req, doc }) => {
    const fullUser = await req.payload.findByID({
        collection: "users",
        id: req.user?.id!
    })
    if (fullUser && typeof fullUser === 'object') {
        const { playlists } = fullUser

        let allIds = [
            ...(playlists?.map((playlist) => typeof playlist === 'object' ? playlist.id : playlist) || [])
        ]
        const index = allIds.findIndex(x => x === doc.id);
        if (index !== -1) {
            allIds.splice(index, 1)
            await req.payload.update({
                collection: "users",
                id: fullUser.id,
                data: {
                    playlists: allIds
                }
            })
        }
    }
}

const isAdminOrHasAccess: Access = ({ req }) => {
    const user = req.user as User | undefined
    if (!user) return false
    if (user.role === "admin") return true

    return {
        user: {
            equals: user.id
        }
    }
}

const addUser: CollectionBeforeChangeHook = ({ data, req }) => {
    return { ...data, user: req.user?.id }
}


const Image: Block = {
    slug: 'image', // required
    imageAltText: 'A nice thumbnail image to show what this block looks like',
    interfaceName: 'QuoteBlock', // optional
    fields: [
      // required
      {
        name: 'image',
        type: "relationship",
        relationTo : "media",
        required: true,
      },
    ],
  }



export const Playlist: CollectionConfig = {

    slug: "playlists",

    admin: {
        useAsTitle: "name",
        hideAPIURL : true,
    },
    hooks: {
        beforeChange: [
            addUser
        ],
        afterChange: [syncUser],
        afterDelete: [
            deletePlaylistInFromUser
        ]

    },

    access: {
        read: ({ req }) => isAdminOrHasAccess({ req }),
        update: ({ req }) => isAdminOrHasAccess({ req }),
        delete: ({ req }) => isAdminOrHasAccess({ req }),
        create: ({ req }) => isAdminOrHasAccess({ req })
    },
    

    fields: [
        {
            name: "name",
            type: "text",
            required: true
        },
        {
            name: "description",
            label: "Playlist Description",
            type: "textarea",
            maxLength: 180
        },
        {
            name: "content",
            label: "Playlist Content",
            type: "relationship",
            relationTo: ['media'],
            hasMany: true
        },

        // {
        //     name: "block", 
        //     label : "Content Blocks",
        //     type : "blocks", 
        //     blocks :[Image]
        // },
        {
            name: "user",
            type: "relationship",
            relationTo: "users",
            required: true,
            admin: {
                condition: () => false
            }
        },

    ]
}