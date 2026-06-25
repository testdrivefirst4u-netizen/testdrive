"use client"

import { useState, useEffect } from "react"
import { MapPin, X, Navigation } from "lucide-react"

const cities = [
"Hyderabad",
"Mumbai",
"Chennai",
"Bangalore",
"Delhi",
"Pune"
]

export function LocationSelector(){

const [open,setOpen] = useState(false)
const [city,setCity] = useState("Select City")

useEffect(()=>{

const saved = localStorage.getItem("city")

if(saved){
setCity(saved)
window.__userCity = saved
}

},[])

useEffect(()=>{

localStorage.setItem("city",city)
window.__userCity = city

},[city])


const detectLocation = ()=>{

navigator.geolocation.getCurrentPosition(

(position)=>{

const lat = position.coords.latitude

if(lat > 12 && lat < 18){
setCity("Hyderabad")
}else if(lat > 18 && lat < 22){
setCity("Mumbai")
}else{
setCity("Your Location")
}

setOpen(false)

},

()=>{
alert("Allow location access")
}

)

}


return(

<>

<button
onClick={()=>setOpen(true)}
className="flex items-center gap-1 text-sm"
>

<MapPin className="w-5 h-5"/>

<span>{city}</span>

</button>


{open && (

<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">

<div className="bg-white p-6 rounded-xl w-[400px]">

<div className="flex justify-between mb-4">

<h3 className="font-semibold text-lg">
Select City
</h3>

<button onClick={()=>setOpen(false)}>
<X/>
</button>

</div>


<button
onClick={detectLocation}
className="border p-3 rounded-lg w-full mb-4 flex items-center gap-2"
>

<Navigation className="w-4 h-4"/>

Use My Current Location

</button>


<div className="grid grid-cols-2 gap-3">

{cities.map((item)=>(
  
<button
key={item}
onClick={()=>{
setCity(item)
setOpen(false)
}}

className="border p-3 rounded-lg hover:bg-gray-50"
>

{item}

</button>

))}

</div>

</div>

</div>

)}

</>

)

}