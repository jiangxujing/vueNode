let http = require('http')
http.get('http://www.imooc.com/u/card',(res)=>{
  let data = ''
  res.on("data",(chunk)=>{
    data+=chunk
  })
  res.on("end",()=>{
    console.log(data)
  })
})
