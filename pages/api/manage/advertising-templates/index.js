import AdvertisingTemplate from "@/models/AdvertisingTemplate";
import colors from "colors";
import timestamp from "console-timestamp";
import db from "@/utils/db";
import { getToken } from 'next-auth/jwt';

const handler = async (req, res) => {

  try {

          if(req.method === "GET"){

        const token = await getToken({ req, secret: process.env.JWT_SECRET }); 
        if (!token) { return res.status(401).json({ message: 'Unauthorized' }); }

        await db.connect();

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search;

        let query = {};
        let sortOption = {};
        let totalCount;
        let templates;
        let debugInfo = {};

        if (search) {
            query = { $text: { $search: search } };
            sortOption = { score: { $meta: "textScore" } };
            debugInfo.searchTerm = search;
            debugInfo.pipelineUsed = 'Full-Text Search Across All Fields';
        } else {
            sortOption = { updatedAt: -1 };
            debugInfo.pipelineUsed = 'No Search Query, Sorted by Last Edited';
        }

        try {    

            totalCount = await AdvertisingTemplate.countDocuments(query);
            templates = await AdvertisingTemplate.find(query)
                .select('-vector')
                .sort(sortOption)
                .skip(skip)
                .limit(limit)
                .lean();

            if (search) {
                // If it's a search query, we want to include the text score
                templates = templates.map(template => ({
                    ...template,
                    score: template._score
                }));
            }
            
        } catch (error) {
            console.error('Query error:', error);
            return res.status(500).json({ message: error.message || 'Error querying the database.' });        
        }

        const totalPages = Math.ceil(totalCount / limit);    

        return res.status(200).json({
            templates,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            },            
        }); 

    }else if(req.method === "POST") {

      const token = await getToken({ req, secret: process.env.JWT_SECRET });
      if (!token) return res.status(401).json({ msg: "Unauthorized" });
     
      await db.connect();    

      console.log('req.body',req.body);

      const template = await AdvertisingTemplate.create(req.body); 

      console.log('template',template)

      res.status(200).json({ template: template, message: "Advertising template created" });

    }else{

       res.status(405).send({ message: "Method not allowed" });
    }

  } catch (error) {
    console.error(`${colors.red("error")} - ${error.message}, ${colors.yellow(req.method + " /api/manage/advertising-templates")} @ ${colors.blue(timestamp("DD-MM-YY hh:mm:ss"))}`);
    res.status(500).send({ message: "Internal Server Error" });
  }

};

export default handler;