import { runQuery } from "schema/v2/test/utils"

describe("GeneFamiliesConnection", () => {
  const api_data = [
    {
      id: "design-concepts-and-techniques",
      name: "Design Concepts and Techniques",
    },
    {
      id: "furniture-and-lighting",
      name: "Furniture & Lighting",
    },
  ]

  it("returns a list of gene families", async () => {
    const geneFamiliesLoader = () => Promise.resolve(api_data)
    const query = `
      {
        geneFamiliesConnection {
          edges {
            node {
              slug
              name
            }
          }
        }
      }
    `

    const geneFamilies = await runQuery(query, { geneFamiliesLoader })

    expect(geneFamilies).toMatchInlineSnapshot(`
      Object {
        "geneFamiliesConnection": Object {
          "edges": Array [
            Object {
              "node": Object {
                "name": "Design Concepts and Techniques",
                "slug": "design-concepts-and-techniques",
              },
            },
            Object {
              "node": Object {
                "name": "Furniture & Lighting",
                "slug": "furniture-and-lighting",
              },
            },
          ],
        },
      }
    `)
  })
})
