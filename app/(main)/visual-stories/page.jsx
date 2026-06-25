"use client"

import Link from "next/link"
import { visualStories } from "@/data/visualStories"

export default function VisualStoriesPage(){

return(

<div className="max-w-7xl mx-auto p-6">

<h1 className="text-2xl font-semibold mb-6">
Car Visual Stories
</h1>

<div className="grid grid-cols-2 md:grid-cols-4 gap-6">

{visualStories.map((story)=>(
  
<Link
href={`/visual-stories/${story.id}`}
key={story.id}
>

<div className="relative rounded-xl overflow-hidden">

<img
src={story.thumbnail}
className="h-[250px] w-full object-cover"
/>

<div className="absolute bottom-2 left-2 text-white text-sm">
{story.title}
</div>

</div>

</Link>

))}

</div>

</div>

)

}