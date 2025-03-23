import { Staff } from "../shared/type";
import { createStaff } from "../shared/util";

export const Staffs: Staff[] = [
    createStaff({
        staffId: "user001", 
        staffName: "Duan Li",
        description: "work hard" , 
        attendance: true,
        rating: 5,  
    }),
    createStaff({
        staffId: "user002", 
        staffName: "Yang Gao",
        description: "work lazy"  ,
        attendance: false,
        rating: 2,  
    }),
]
