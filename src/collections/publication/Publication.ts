import { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionBeforeChangeHook, CollectionBeforeValidateHook, CollectionConfig } from "payload";


const addUser: CollectionBeforeChangeHook = ({ req, data }) => {
    return { ...data, user: req.user?.id }
}

const syncWithUserScreens: CollectionAfterChangeHook = async ({ req, doc }) => {
    const { screens } = doc;
    for (let screen of screens) {
        await req.payload.update({
            collection: "screens",
            id: screen,
            data: {
                publication: doc.id
            },
            req: req,
            user: req.user
        })
    }

}

const deletePulblicationInScreenDocument: CollectionAfterDeleteHook = async ({ req, doc }) => {
    const { screens } = doc;
    for (let screen of screens) {
        await req.payload.update({
            collection: "screens",
            id: screen,
            data: {
                publication: undefined
            }
        })
    }
}

const syncWithUser: CollectionAfterChangeHook = async ({ req, doc }) => {
    const fullUser = await req.payload.findByID({
        collection: "users",
        id: req.user?.id!
    })

    if (fullUser && typeof fullUser === 'object') {
        let { publications } = fullUser
        let allPublicationids = [...publications?.map((publication) => typeof publication === "object" ? publication.id : publication) || []]
        const createsPublicationIds = allPublicationids.filter((id, index) => allPublicationids.indexOf(id) === index)
        const newPublicationIds = [...createsPublicationIds, doc.id]

        await req.payload.update({
            collection: "users",
            id: req.user?.id!,
            data: {
                publications: newPublicationIds
            }
        })

    }

}

const deletePublicationFromUserCollection: CollectionAfterDeleteHook = async ({ req, doc }) => {
    const fullUser = await req.payload.findByID({
        collection: "users",
        id: req.user?.id!,
    })
    if (fullUser && typeof fullUser === 'object') {
        const { publications } = fullUser;
        let allPublicationids = [
            ...(publications?.map((publication) => typeof publication === 'object' ? publication.id : publication) || [])
        ]

        const index = allPublicationids.findIndex(id => id === doc.id);
        if (index !== -1) {
            // remove publication id from list
            allPublicationids.splice(index, 1)

            await req.payload.update({
                collection: "users",
                id: fullUser.id,
                data: {
                    publications: allPublicationids
                }
            })
        }
    }

}
const validate: CollectionBeforeValidateHook = ({ }) => {
    return false;
}


export const Publication: CollectionConfig = {
    slug: "publications",

    admin: {
        useAsTitle: "name",
        defaultColumns: ['name'],
        hideAPIURL : true,
    },

    hooks: {
        beforeChange: [addUser],
        afterChange: [syncWithUser, syncWithUserScreens],
        afterDelete: [deletePublicationFromUserCollection, deletePulblicationInScreenDocument],
    },

    access: {

    },

    fields: [
        {
            type: "row",
            fields: [{
                name: "name",
                type: "text",
                label: "Publication Name",
                required: true,
                minLength: 3,
                maxLength: 50
            },
            {
                name: "description",
                label: "Publication Description",
                type: "textarea",
                maxLength: 130
            },]
        },

        {
            name: "content",
            label: "Content",
            type: "relationship",
            relationTo: ["media", "playlists"],
            hasMany: true,
            required: true
        },
        {
            name: "screens",
            label: "Screens",
            type: "relationship",
            relationTo: "screens",
            hasMany: true,
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