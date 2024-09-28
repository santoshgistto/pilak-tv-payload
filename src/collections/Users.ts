import type { Access, CollectionConfig, User } from 'payload'


const isAdmin: Access = ({ req }) => {
  const user = req.user as User | undefined

  if (!user) return false
  if (user.role === "admin") return true;

  return false;

}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    hidden: ({ user }) => user?.role !== 'admin',
  },
  hooks: {},
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin
  },
  auth: true,
  fields: [
    {
      name: "publications",
      type: "relationship",
      relationTo: "publications",
      hasMany: true,
      admin: {
        condition: () => false
      }
    },
    {
      name: "playlists",
      type: "relationship",
      relationTo: "playlists",
      hasMany: true,
      admin: {
        condition: () => false
      }
    },
    {
      name: "screens",
      type: "relationship",
      relationTo: "screens",
      hasMany: true,
      admin: {
        condition: () => false
      }

    },
    {
      name: "media",
      type: "relationship",
      relationTo: "media",
      hasMany: true,
      admin: {
        condition: () => false
      }
    },

    {
      name: "role",
      type: "select",
      defaultValue: "orgOwner",
      options: [
        {
          label: "User",
          value: "user"
        },
        {
          label: "Super Admin",
          value: "admin",
        },
        // {
        //   label: "Organisation Owner",
        //   value: "orgOwner"
        // },
        // {
        //   label: "Organisation user",
        //   value: "orgUser"
        // }
      ],

    }
  ],
}
