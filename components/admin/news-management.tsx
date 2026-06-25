"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Search, Calendar } from "lucide-react"

export function NewsManagement() {
  const [articles, setArticles] = useState([
    {
      id: 1,
      title: "Electric Vehicle Market Trends 2024",
      excerpt: "The EV market is experiencing unprecedented growth...",
      author: "Admin",
      date: "2024-01-15",
      status: "Published",
      category: "Electric Vehicles",
    },
    {
      id: 2,
      title: "Top 10 Cars Under 10 Lakhs",
      excerpt: "Best budget-friendly cars for Indian families...",
      author: "Admin",
      date: "2024-01-14",
      status: "Draft",
      category: "Car Reviews",
    },
  ])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [newArticle, setNewArticle] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    tags: "",
    image: "",
  })

  const handleAddArticle = () => {
    const article = {
      id: articles.length + 1,
      title: newArticle.title,
      excerpt: newArticle.excerpt,
      author: "Admin",
      date: new Date().toISOString().split("T")[0],
      status: "Draft",
      category: newArticle.category,
    }
    setArticles([...articles, article])
    setNewArticle({ title: "", excerpt: "", content: "", category: "", tags: "", image: "" })
    setIsAddDialogOpen(false)
  }

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">News Management</h3>
          <p className="text-gray-600">Manage news articles and blog posts</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Article</DialogTitle>
              <DialogDescription>Write a new news article or blog post</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Article Title</Label>
                <Input
                  id="title"
                  value={newArticle.title}
                  onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                  placeholder="Enter article title..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={newArticle.excerpt}
                  onChange={(e) => setNewArticle({ ...newArticle, excerpt: e.target.value })}
                  placeholder="Brief description of the article..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newArticle.category}
                  onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                  placeholder="e.g., Electric Vehicles, Car Reviews"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={newArticle.tags}
                  onChange={(e) => setNewArticle({ ...newArticle, tags: e.target.value })}
                  placeholder="e.g., EV, Tesla, Review"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Featured Image URL</Label>
                <Input
                  id="image"
                  value={newArticle.image}
                  onChange={(e) => setNewArticle({ ...newArticle, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Article Content</Label>
                <Textarea
                  id="content"
                  value={newArticle.content}
                  onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                  placeholder="Write your article content here..."
                  rows={8}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddArticle} className="bg-gradient-to-r from-red-500 to-orange-500">
                Create Article
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredArticles.map((article) => (
          <Card key={article.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{article.title}</CardTitle>
                  <CardDescription className="mb-3">{article.excerpt}</CardDescription>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {article.date}
                    </span>
                    <span>By {article.author}</span>
                    <Badge variant="outline">{article.category}</Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={article.status === "Published" ? "default" : "secondary"}>{article.status}</Badge>
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
