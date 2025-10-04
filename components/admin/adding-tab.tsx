"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Package,
  Tag,
  Palette,
  Wrench,
  Ruler,
  Search,
  Filter
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { 
  getMainGroups,
  createMainGroup,
  getSubGroups,
  createSubGroup,
  getColors,
  createColor,
  getMaterials,
  createMaterial,
  getUnitsOfMeasurement,
  createUnitOfMeasurement,
  updateUnitOfMeasurement,
  deleteUnitOfMeasurement
} from "@/lib/warehouse"

export function AddingTab() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("main-groups")
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Data states
  const [mainGroups, setMainGroups] = useState<any[]>([])
  const [subGroups, setSubGroups] = useState<any[]>([])
  const [colors, setColors] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [units, setUnits] = useState<any[]>([])

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [selectedItemType, setSelectedItemType] = useState<string>("")
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    code: '',
    description: '',
    color_code: '',
    material_type: '',
    unit_symbol: '',
    unit_type: '',
    conversion_factor: 1,
    is_user_defined: true
  })

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      const [mainGroupsData, subGroupsData, colorsData, materialsData, unitsData] = await Promise.all([
        getMainGroups().catch(() => []),
        getSubGroups().catch(() => []),
        getColors().catch(() => []),
        getMaterials().catch(() => []),
        getUnitsOfMeasurement().catch(() => [])
      ])

      setMainGroups(mainGroupsData || [])
      setSubGroups(subGroupsData || [])
      setColors(colorsData || [])
      setMaterials(materialsData || [])
      setUnits(unitsData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async () => {
    setIsCreating(true)
    try {
      let result
      const baseData = {
        name: formData.name,
        name_ar: formData.name_ar || formData.name,
        description: formData.description
      }

      switch (selectedItemType) {
        case 'main-group':
          result = await createMainGroup({
            group_name: formData.name,
            group_name_ar: formData.name_ar || formData.name,
            description: formData.description
          })
          setMainGroups(prev => [result, ...prev])
          break

        case 'sub-group':
          result = await createSubGroup({
            sub_group_name: formData.name,
            sub_group_name_ar: formData.name_ar || formData.name,
            main_group_id: 1, // Default main group
            description: formData.description
          })
          setSubGroups(prev => [result, ...prev])
          break

        case 'color':
          result = await createColor({
            color_name: formData.name,
            color_name_ar: formData.name_ar || formData.name,
            color_code: formData.color_code,
            description: formData.description
          })
          setColors(prev => [result, ...prev])
          break

        case 'material':
          result = await createMaterial({
            material_name: formData.name,
            material_name_ar: formData.name_ar || formData.name,
            material_type: formData.material_type,
            description: formData.description
          })
          setMaterials(prev => [result, ...prev])
          break

        case 'unit':
          result = await createUnitOfMeasurement({
            unit_name: formData.name,
            unit_code: formData.code,
            unit_symbol: formData.unit_symbol,
            unit_type: formData.unit_type,
            conversion_factor: formData.conversion_factor,
            is_user_defined: formData.is_user_defined
          })
          setUnits(prev => [result, ...prev])
          break
      }

      resetForm()
      setIsAddDialogOpen(false)
      alert(t("adding.addingItemSuccess"))
    } catch (error) {
      console.error('Error adding item:', error)
      alert(t("adding.addingItemError"))
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditItem = async () => {
    setIsUpdating(true)
    try {
      // Update logic for each item type
      switch (selectedItemType) {
        case 'unit':
          await updateUnitOfMeasurement(selectedItem.id, {
            unit_name: formData.name,
            unit_code: formData.code,
            unit_symbol: formData.unit_symbol,
            unit_type: formData.unit_type,
            conversion_factor: formData.conversion_factor,
            is_user_defined: formData.is_user_defined
          })
          setUnits(prev => prev.map(item => 
            item.id === selectedItem.id ? { ...item, ...formData } : item
          ))
          break
        // Add other update cases as needed
      }

      resetForm()
      setIsEditDialogOpen(false)
      alert(t("adding.updateItemSuccess"))
    } catch (error) {
      console.error('Error updating item:', error)
      alert(t("adding.updateItemError"))
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteItem = async () => {
    setIsDeleting(true)
    try {
      switch (selectedItemType) {
        case 'unit':
          await deleteUnitOfMeasurement(selectedItem.id)
          setUnits(prev => prev.filter(item => item.id !== selectedItem.id))
          break
        // Add other delete cases as needed
      }

      setIsDeleteDialogOpen(false)
      alert(t("adding.deleteItemSuccess"))
    } catch (error) {
      console.error('Error deleting item:', error)
      alert(t("adding.deleteItemError"))
    } finally {
      setIsDeleting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      name_ar: '',
      code: '',
      description: '',
      color_code: '',
      material_type: '',
      unit_symbol: '',
      unit_type: '',
      conversion_factor: 1,
      is_user_defined: true
    })
    setSelectedItem(null)
    setSelectedItemType("")
  }

  const openAddDialog = (type: string) => {
    setSelectedItemType(type)
    resetForm()
    setIsAddDialogOpen(true)
  }

  const openEditDialog = (item: any, type: string) => {
    setSelectedItem(item)
    setSelectedItemType(type)
    setFormData({
      name: item.name || item.group_name || item.sub_group_name || item.color_name || item.material_name || item.unit_name || '',
      name_ar: item.name_ar || item.group_name_ar || item.sub_group_name_ar || item.color_name_ar || item.material_name_ar || '',
      code: item.code || item.unit_code || '',
      description: item.description || '',
      color_code: item.color_code || '',
      material_type: item.material_type || '',
      unit_symbol: item.unit_symbol || '',
      unit_type: item.unit_type || '',
      conversion_factor: item.conversion_factor || 1,
      is_user_defined: item.is_user_defined !== undefined ? item.is_user_defined : true
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (item: any, type: string) => {
    setSelectedItem(item)
    setSelectedItemType(type)
    setIsDeleteDialogOpen(true)
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'main-group': return <Package className="h-4 w-4" />
      case 'sub-group': return <Tag className="h-4 w-4" />
      case 'color': return <Palette className="h-4 w-4" />
      case 'material': return <Wrench className="h-4 w-4" />
      case 'unit': return <Ruler className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const getItemTitle = (type: string) => {
    switch (type) {
      case 'main-group': return t("adding.mainGroups")
      case 'sub-group': return t("adding.subGroups")
      case 'color': return t("adding.colors")
      case 'material': return t("adding.materials")
      case 'unit': return t("adding.units")
      default: return t("adding.title")
    }
  }

  const filterData = (data: any[]) => {
    if (!searchTerm) return data
    return data.filter(item => 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.group_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sub_group_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.color_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.material_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.unit_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">{t("adding.loading")}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("adding.title")}</h2>
          <p className="text-gray-600">{t("adding.description")}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              placeholder={t("adding.searchItems")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="main-groups">{t("adding.mainGroups")}</TabsTrigger>
          <TabsTrigger value="sub-groups">{t("adding.subGroups")}</TabsTrigger>
          <TabsTrigger value="colors">{t("adding.colors")}</TabsTrigger>
          <TabsTrigger value="materials">{t("adding.materials")}</TabsTrigger>
          <TabsTrigger value="units">{t("adding.units")}</TabsTrigger>
        </TabsList>

        {/* Main Groups Tab */}
        <TabsContent value="main-groups" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t("adding.mainGroups")}</h3>
            <Button onClick={() => openAddDialog('main-group')}>
              <Plus className="h-4 w-4 mr-2" />
              {t("adding.addMainGroup")}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterData(mainGroups).map((group) => (
              <Card key={group.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getItemIcon('main-group')}
                      <CardTitle className="text-lg">{group.group_name || group.name}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(group, 'main-group')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(group, 'main-group')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {group.group_name_ar && (
                    <p className="text-sm text-gray-600 mb-2">{group.group_name_ar}</p>
                  )}
                  {group.description && (
                    <p className="text-sm text-gray-500">{group.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Sub Groups Tab */}
        <TabsContent value="sub-groups" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t("adding.subGroups")}</h3>
            <Button onClick={() => openAddDialog('sub-group')}>
              <Plus className="h-4 w-4 mr-2" />
              {t("adding.addSubGroup")}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterData(subGroups).map((subGroup) => (
              <Card key={subGroup.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getItemIcon('sub-group')}
                      <CardTitle className="text-lg">{subGroup.sub_group_name || subGroup.name}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(subGroup, 'sub-group')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(subGroup, 'sub-group')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {subGroup.sub_group_name_ar && (
                    <p className="text-sm text-gray-600 mb-2">{subGroup.sub_group_name_ar}</p>
                  )}
                  {subGroup.description && (
                    <p className="text-sm text-gray-500">{subGroup.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t("adding.colors")}</h3>
            <Button onClick={() => openAddDialog('color')}>
              <Plus className="h-4 w-4 mr-2" />
              {t("adding.addColor")}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterData(colors).map((color) => (
              <Card key={color.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getItemIcon('color')}
                      <CardTitle className="text-lg">{color.color_name || color.name}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(color, 'color')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(color, 'color')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {color.color_name_ar && (
                    <p className="text-sm text-gray-600 mb-2">{color.color_name_ar}</p>
                  )}
                  {color.color_code && (
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm text-gray-500">كود اللون:</span>
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: color.color_code }}
                      ></div>
                      <span className="text-sm font-mono">{color.color_code}</span>
                    </div>
                  )}
                  {color.description && (
                    <p className="text-sm text-gray-500">{color.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t("adding.materials")}</h3>
            <Button onClick={() => openAddDialog('material')}>
              <Plus className="h-4 w-4 mr-2" />
              {t("adding.addMaterial")}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterData(materials).map((material) => (
              <Card key={material.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getItemIcon('material')}
                      <CardTitle className="text-lg">{material.material_name || material.name}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(material, 'material')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(material, 'material')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {material.material_name_ar && (
                    <p className="text-sm text-gray-600 mb-2">{material.material_name_ar}</p>
                  )}
                  {material.material_type && (
                    <Badge variant="outline" className="mb-2">{material.material_type}</Badge>
                  )}
                  {material.description && (
                    <p className="text-sm text-gray-500">{material.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Units Tab */}
        <TabsContent value="units" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t("adding.units")}</h3>
            <Button onClick={() => openAddDialog('unit')}>
              <Plus className="h-4 w-4 mr-2" />
              {t("adding.addUnit")}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterData(units).map((unit) => (
              <Card key={unit.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getItemIcon('unit')}
                      <CardTitle className="text-lg">{unit.unit_name || unit.name}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(unit, 'unit')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(unit, 'unit')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {unit.unit_code && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">الكود:</span>
                        <span className="text-sm font-mono">{unit.unit_code}</span>
                      </div>
                    )}
                    {unit.unit_symbol && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">الرمز:</span>
                        <span className="text-sm font-mono">{unit.unit_symbol}</span>
                      </div>
                    )}
                    {unit.unit_type && (
                      <Badge variant="outline">{unit.unit_type}</Badge>
                    )}
                    {unit.conversion_factor && unit.conversion_factor !== 1 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">معامل التحويل:</span>
                        <span className="text-sm font-mono">{unit.conversion_factor}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("adding.add")} {getItemTitle(selectedItemType)}</DialogTitle>
            <DialogDescription>
              {t("adding.enterDetails")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("adding.name")} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t("adding.enterName")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_ar">{t("adding.nameAr")}</Label>
                <Input
                  id="name_ar"
                  value={formData.name_ar}
                  onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                  placeholder={t("adding.enterNameAr")}
                />
              </div>
            </div>

            {selectedItemType === 'color' && (
              <div className="space-y-2">
                <Label htmlFor="color_code">{t("adding.colorCode")}</Label>
                <Input
                  id="color_code"
                  value={formData.color_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, color_code: e.target.value }))}
                  placeholder="#FF0000"
                />
              </div>
            )}

            {selectedItemType === 'material' && (
              <div className="space-y-2">
                <Label htmlFor="material_type">{t("adding.materialType")}</Label>
                <Input
                  id="material_type"
                  value={formData.material_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, material_type: e.target.value }))}
                  placeholder={t("adding.enterMaterialType")}
                />
              </div>
            )}

            {selectedItemType === 'unit' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unit_code">{t("adding.unitCode")}</Label>
                    <Input
                      id="unit_code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      placeholder={t("adding.enterUnitCode")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit_symbol">{t("adding.unitSymbol")}</Label>
                    <Input
                      id="unit_symbol"
                      value={formData.unit_symbol}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit_symbol: e.target.value }))}
                      placeholder={t("adding.enterUnitSymbol")}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unit_type">{t("adding.unitType")}</Label>
                    <Select value={formData.unit_type} onValueChange={(value) => setFormData(prev => ({ ...prev, unit_type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("adding.selectUnitType")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LENGTH">{t("adding.unitTypes.LENGTH")}</SelectItem>
                        <SelectItem value="WEIGHT">{t("adding.unitTypes.WEIGHT")}</SelectItem>
                        <SelectItem value="VOLUME">{t("adding.unitTypes.VOLUME")}</SelectItem>
                        <SelectItem value="AREA">{t("adding.unitTypes.AREA")}</SelectItem>
                        <SelectItem value="COUNT">{t("adding.unitTypes.COUNT")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conversion_factor">{t("adding.conversionFactor")}</Label>
                    <Input
                      id="conversion_factor"
                      type="number"
                      step="0.01"
                      value={formData.conversion_factor}
                      onChange={(e) => setFormData(prev => ({ ...prev, conversion_factor: parseFloat(e.target.value) || 1 }))}
                      placeholder="1"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">{t("adding.description")}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t("adding.enterDescription")}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t("adding.cancel")}
            </Button>
            <Button 
              onClick={handleAddItem} 
              disabled={isCreating || !formData.name}
            >
              {isCreating ? t("adding.addingItem") : t("adding.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("adding.edit")} {getItemTitle(selectedItemType)}</DialogTitle>
            <DialogDescription>
              {t("adding.editDetails")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">{t("adding.name")} *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t("adding.enterName")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name_ar">{t("adding.nameAr")}</Label>
                <Input
                  id="edit-name_ar"
                  value={formData.name_ar}
                  onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                  placeholder={t("adding.enterNameAr")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">{t("adding.description")}</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t("adding.enterDescription")}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t("adding.cancel")}
            </Button>
            <Button 
              onClick={handleEditItem} 
              disabled={isUpdating || !formData.name}
            >
              {isUpdating ? t("adding.updatingItem") : t("adding.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Item Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("adding.confirmDelete")}</DialogTitle>
            <DialogDescription>
              {t("adding.confirmDeleteMessage")}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="py-4">
              <div className="flex items-center space-x-2">
                {getItemIcon(selectedItemType)}
                <span className="font-medium">
                  {selectedItem.name || selectedItem.group_name || selectedItem.sub_group_name || selectedItem.color_name || selectedItem.material_name || selectedItem.unit_name}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t("adding.cancel")}
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteItem} 
              disabled={isDeleting}
            >
              {isDeleting ? t("adding.deletingItem") : t("adding.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
