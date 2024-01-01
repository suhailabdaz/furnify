const category=require('.././server/model/category_model')
const userModel=require('.././server/model/user_model')




const loadCategory=async(req,res,next)=>{
    try {
      res.locals.isAuth = req.session.isAuth || false;
        const categories = await category.find(); 
        res.locals.categories = categories; 
        next(); 
      } catch (error) {
       
        console.error('Error fetching categories:', error);
        res.status(500).send('Internal Server Error');
      }
}
const iflogged=async(req,res,next)=>{
  if(req.session.isAuth){
    res.redirect('/')
  }else{
    next()
  }
}
const islogged=async(req,res,next)=>{
const user= await userModel.findOne({_id:req.session.userId})

if(req.session.isAuth &&user && user.status==false){
  next()
}
  else{
    res.redirect('/profile')
  }
}





const loggedout=async(req,res,next)=>{
  if(req.session.user){
    next()
  }else{
    res.redirect('/')
  }
}

const checkSessionVariable = (variableName,redirectPath) => {
    return (req, res, next) => {
      
      if (req.session[variableName]) {

        next();
      } else {
      
        res.redirect(redirectPath);
      }
    };
  };



  const loggedadmin = (req, res, next) => {
    if(req.session.admin){
    
        next()
    } else {
        res.redirect('/admin')
    }
}


const logoutAdmin = (req, res, next) => {
    if(!req.session.admin){
        next()
    } else {
        res.redirect('/admin/adminpanel')
    }
}
const logouting = (req,res,next) => {
    req.session.admin=false;
    req.session.destroy();
    res.redirect('/admin')
}





module.exports ={
    logoutAdmin,
    loggedadmin,
    logouting,
    loadCategory,
    islogged,
    loggedout,
    iflogged,
    checkSessionVariable

}