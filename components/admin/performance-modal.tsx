'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  Plus, 
  Edit, 
  Save, 
  X, 
  AlertCircle,
  Loader2,
  CheckCircle,
  User,
  TrendingUp,
  Target,
  Star,
  Calendar,
  FileText,
  Award,
  Zap,
  Clock,
  Users,
  MessageSquare
} from 'lucide-react'
import { toast } from 'sonner'
import type { Employee, PerformanceReview, CreatePerformanceReviewData, UpdatePerformanceReviewData, PerformanceStats } from '@/types/employees'
import { getEmployeePerformanceReviews, createPerformanceReview, updatePerformanceReview, getPerformanceStats } from '@/lib/employees'

interface PerformanceModalProps {
  employee: Employee
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PerformanceModal({ employee, open, onOpenChange }: PerformanceModalProps) {
  const [reviews, setReviews] = useState<PerformanceReview[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [editingReview, setEditingReview] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<PerformanceStats | null>(null)

  const [newReview, setNewReview] = useState<CreatePerformanceReviewData>({
    employee_id: employee.id,
    review_period_start: '',
    review_period_end: '',
    overall_rating: 0,
    punctuality_rating: 0,
    work_quality_rating: 0,
    teamwork_rating: 0,
    communication_rating: 0,
    goals_achieved: 0,
    goals_total: 0,
    strengths: '',
    areas_for_improvement: '',
    manager_notes: '',
    employee_notes: '',
    review_date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (open) {
      fetchReviews()
      fetchStats()
    }
  }, [open, employee.id])

  const fetchReviews = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await getEmployeePerformanceReviews(employee.id)
      if (error) {
        setError(error)
        toast.error('Failed to fetch performance reviews')
        return
      }
      setReviews(data || [])
    } catch (err) {
      setError('An unexpected error occurred')
      toast.error('Failed to fetch performance reviews')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const { data, error } = await getPerformanceStats(employee.id)
      if (error) {
        console.error('Failed to fetch stats:', error)
        return
      }
      setStats(data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  const handleAddReview = async () => {
    if (!newReview.review_period_start || !newReview.review_period_end) {
      toast.error('Please select review period dates')
      return
    }

    setIsSaving(true)
    try {
      const { data, error } = await createPerformanceReview(newReview)
      if (error) {
        toast.error(error)
        return
      }

      if (data) {
        setReviews(prev => [data, ...prev])
        setNewReview({
          employee_id: employee.id,
          review_period_start: '',
          review_period_end: '',
          overall_rating: 0,
          punctuality_rating: 0,
          work_quality_rating: 0,
          teamwork_rating: 0,
          communication_rating: 0,
          goals_achieved: 0,
          goals_total: 0,
          strengths: '',
          areas_for_improvement: '',
          manager_notes: '',
          employee_notes: '',
          review_date: new Date().toISOString().split('T')[0]
        })
        fetchStats()
        toast.success('Performance review added successfully!')
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateReview = async (review: PerformanceReview) => {
    setIsSaving(true)
    try {
      const updateData: UpdatePerformanceReviewData = {
        id: review.id,
        review_period_start: review.review_period_start,
        review_period_end: review.review_period_end,
        overall_rating: review.overall_rating,
        punctuality_rating: review.punctuality_rating,
        work_quality_rating: review.work_quality_rating,
        teamwork_rating: review.teamwork_rating,
        communication_rating: review.communication_rating,
        goals_achieved: review.goals_achieved,
        goals_total: review.goals_total,
        strengths: review.strengths,
        areas_for_improvement: review.areas_for_improvement,
        manager_notes: review.manager_notes,
        employee_notes: review.employee_notes,
        review_date: review.review_date
      }

      const { data, error } = await updatePerformanceReview(updateData)
      if (error) {
        toast.error(error)
        return
      }

      if (data) {
        setReviews(prev => prev.map(r => r.id === review.id ? data : r))
        setEditingReview(null)
        fetchStats()
        toast.success('Performance review updated successfully!')
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 3.5) return 'text-blue-600'
    if (rating >= 2.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return 'Excellent'
    if (rating >= 3.5) return 'Good'
    if (rating >= 2.5) return 'Satisfactory'
    return 'Needs Improvement'
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'fill-current text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Management - {employee.first_name} {employee.last_name}
          </DialogTitle>
          <DialogDescription>
            Track and manage employee performance reviews and goals
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Performance Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Average Rating</span>
                </div>
                <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">
                  {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Goals Achievement</span>
                </div>
                <div className="text-2xl font-bold">{stats.goalsAchievementRate.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">
                  Goal completion rate
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Rating Distribution</span>
                </div>
                <div className="text-2xl font-bold">
                  {Object.keys(stats.ratingDistribution).length}
                </div>
                <div className="text-xs text-muted-foreground">
                  Rating levels
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Improvement Areas</span>
                </div>
                <div className="text-2xl font-bold">{stats.improvementAreas.length}</div>
                <div className="text-xs text-muted-foreground">
                  Areas identified
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add New Performance Review */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              Add Performance Review
            </CardTitle>
            <CardDescription>Create a new performance review for this employee</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="review_period_start">Review Period Start *</Label>
                <Input
                  id="review_period_start"
                  type="date"
                  value={newReview.review_period_start}
                  onChange={(e) => setNewReview(prev => ({ ...prev, review_period_start: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="review_period_end">Review Period End *</Label>
                <Input
                  id="review_period_end"
                  type="date"
                  value={newReview.review_period_end}
                  onChange={(e) => setNewReview(prev => ({ ...prev, review_period_end: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="review_date">Review Date</Label>
                <Input
                  id="review_date"
                  type="date"
                  value={newReview.review_date}
                  onChange={(e) => setNewReview(prev => ({ ...prev, review_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goals_achieved">Goals Achieved</Label>
                <Input
                  id="goals_achieved"
                  type="number"
                  value={newReview.goals_achieved || ''}
                  onChange={(e) => setNewReview(prev => ({ ...prev, goals_achieved: e.target.value ? Number(e.target.value) : 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goals_total">Total Goals</Label>
                <Input
                  id="goals_total"
                  type="number"
                  value={newReview.goals_total || ''}
                  onChange={(e) => setNewReview(prev => ({ ...prev, goals_total: e.target.value ? Number(e.target.value) : 0 }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="strengths">Strengths</Label>
                <Textarea
                  id="strengths"
                  value={newReview.strengths || ''}
                  onChange={(e) => setNewReview(prev => ({ ...prev, strengths: e.target.value }))}
                  placeholder="Employee strengths and achievements..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="areas_for_improvement">Areas for Improvement</Label>
                <Textarea
                  id="areas_for_improvement"
                  value={newReview.areas_for_improvement || ''}
                  onChange={(e) => setNewReview(prev => ({ ...prev, areas_for_improvement: e.target.value }))}
                  placeholder="Areas that need improvement..."
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manager_notes">Manager Notes</Label>
                <Textarea
                  id="manager_notes"
                  value={newReview.manager_notes || ''}
                  onChange={(e) => setNewReview(prev => ({ ...prev, manager_notes: e.target.value }))}
                  placeholder="Manager's comments and recommendations..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee_notes">Employee Notes</Label>
                <Textarea
                  id="employee_notes"
                  value={newReview.employee_notes || ''}
                  onChange={(e) => setNewReview(prev => ({ ...prev, employee_notes: e.target.value }))}
                  placeholder="Employee's self-assessment..."
                  rows={3}
                />
              </div>
            </div>

            <Button onClick={handleAddReview} disabled={isSaving} className="gap-2">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Performance Review
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Performance Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Performance Reviews
            </CardTitle>
            <CardDescription>
              {reviews.length} review{reviews.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-32"></div>
                      <div className="h-3 bg-muted rounded w-24"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No performance reviews</h3>
                <p className="text-muted-foreground">Add performance reviews to track employee progress</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">
                          {new Date(review.review_period_start).toLocaleDateString()} - {new Date(review.review_period_end).toLocaleDateString()}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Review Date: {new Date(review.review_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {editingReview === review.id ? (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateReview(review)}
                              disabled={isSaving}
                            >
                              {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingReview(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingReview(review.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Ratings */}
                    {review.overall_rating && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Overall Rating</span>
                            <div className="flex items-center gap-1">
                              {renderStars(review.overall_rating)}
                              <span className={`text-sm font-medium ${getRatingColor(review.overall_rating)}`}>
                                {review.overall_rating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                          <Progress value={(review.overall_rating / 5) * 100} className="h-2" />
                          <p className="text-xs text-muted-foreground">{getRatingLabel(review.overall_rating)}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Goals Achievement</span>
                            <span className="text-sm font-medium">
                              {review.goals_achieved}/{review.goals_total}
                            </span>
                          </div>
                          <Progress value={(review.goals_achieved / review.goals_total) * 100} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {review.goals_total > 0 ? Math.round((review.goals_achieved / review.goals_total) * 100) : 0}% completed
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Detailed Ratings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {review.punctuality_rating && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Punctuality</span>
                            <span className="text-sm">{review.punctuality_rating.toFixed(1)}</span>
                          </div>
                          <Progress value={(review.punctuality_rating / 5) * 100} className="h-1" />
                        </div>
                      )}
                      {review.work_quality_rating && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Work Quality</span>
                            <span className="text-sm">{review.work_quality_rating.toFixed(1)}</span>
                          </div>
                          <Progress value={(review.work_quality_rating / 5) * 100} className="h-1" />
                        </div>
                      )}
                      {review.teamwork_rating && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Teamwork</span>
                            <span className="text-sm">{review.teamwork_rating.toFixed(1)}</span>
                          </div>
                          <Progress value={(review.teamwork_rating / 5) * 100} className="h-1" />
                        </div>
                      )}
                      {review.communication_rating && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Communication</span>
                            <span className="text-sm">{review.communication_rating.toFixed(1)}</span>
                          </div>
                          <Progress value={(review.communication_rating / 5) * 100} className="h-1" />
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {review.strengths && (
                        <div>
                          <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                            <Award className="h-4 w-4 text-green-600" />
                            Strengths
                          </h5>
                          <p className="text-sm text-muted-foreground">{review.strengths}</p>
                        </div>
                      )}
                      {review.areas_for_improvement && (
                        <div>
                          <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            Areas for Improvement
                          </h5>
                          <p className="text-sm text-muted-foreground">{review.areas_for_improvement}</p>
                        </div>
                      )}
                      {review.manager_notes && (
                        <div>
                          <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                            <Users className="h-4 w-4 text-purple-600" />
                            Manager Notes
                          </h5>
                          <p className="text-sm text-muted-foreground">{review.manager_notes}</p>
                        </div>
                      )}
                      {review.employee_notes && (
                        <div>
                          <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                            <MessageSquare className="h-4 w-4 text-orange-600" />
                            Employee Notes
                          </h5>
                          <p className="text-sm text-muted-foreground">{review.employee_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
