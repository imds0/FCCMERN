let restaurants

export default class RestaurantsDAO {
    // conect to db when server starts 
    static async injectDB(conn) {
        // if allready exist just return
        if (restaurants) {
            return
        }
        // try to connect to specific collection
        try {
            // sample_restaurants -> restaurants
            restaurants = await conn.db(process.env.RESTREVIEWS_NS).collection("restaurants")
        } catch (e) {
            console.error(
                `Unable to establish a collection handle in restaurantsDAO: ${e}`,
            )
        }

    }
    
    // get queries
    static async getRestaurants({
        filters = null,
        page = 0,
        restaurantsPerPage = 20,
    } = {}) {
        let query
        if (filters){
            if ("name" in filters) {
                //search in text that contains filters["name"]
                query = { $text: {$search: filters["name"] } }
            } else if ("cuisine" in filters) {
                //cuisine field equal filters["cuisine"]
                query = { "cuisine": { $eq: filters["cuisine"] } }
            } else if ("zipcode" in filters) {
                query = { "address.zipcode": { $eq: filters["zipcode"] } }
            }
        }

        let cursor

        try {
            // query the db
            cursor = await restaurants
                .find(query)
        } catch(e) {
            console.error(`Unable to issue find command, ${e}`)
            return { restaurantsList: [], totalNumRestaurants: 0}
        }

        const displayCursor = cursor.limit(restaurantsPerPage).skip(restaurantsPerPage * page)

        try {
            const restaurantsList = await displayCursor.toArray()
            const totalNumRestaurants = await restaurants.countDocuments(query)
            // Return results from db
            return {restaurantsList, totalNumRestaurants}
        } catch(e) {
            console.error(
                `Unable to convert cursos to array or problem counting documents, ${e}`,
            )
            return { restaurantsList: [], totalNumRestaurants:0 }
        }

    }
}

