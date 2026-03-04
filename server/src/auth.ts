import { Router, type Request, type Response } from 'express';

const router = Router();

router.post("/register", (req: Request, res: Response) => {
    console.log("Req body: ", req.body);
    console.log("req params: ", req.params);

    

});

router.post("/login", (req: Request, res: Response) => {
    console.log("Req body: ", req.body);
    console.log("req params: ", req.params);

    
});