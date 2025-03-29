import { useLocation } from "react-router-dom"

const getPath =(path, seconPath)=>{
   let visible = 'flex'
   

   const location = useLocation()

    if(location.pathname !== path){

    return visible = 'none'
          

    }
    return visible
}
export default getPath