"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, Search, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCustomers } from "@/lib/customers"

interface Customer {
  id: string
  customer_id: string
  name: string
  email: string
  phone: string
  address: string
  status: string
}

interface CustomerSelectionDropdownProps {
  selectedCustomer: Customer | null
  onCustomerSelect: (customer: Customer | null) => void
  placeholder?: string
  className?: string
}

export function CustomerSelectionDropdown({
  selectedCustomer,
  onCustomerSelect,
  placeholder = "Select customer...",
  className
}: CustomerSelectionDropdownProps) {
  const [open, setOpen] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Load customers on component mount
  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      console.log('🔍 Loading customers for selection...')
      
      const { data: customersData, error } = await getCustomers()
      
      if (error) {
        console.error('❌ Error loading customers:', error)
        return
      }

      if (customersData) {
        console.log('✅ Loaded customers:', customersData.length)
        setCustomers(customersData)
      } else {
        console.log('⚠️ No customers found')
        setCustomers([])
      }
    } catch (error) {
      console.error('❌ Error in loadCustomers:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase()
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.customer_id.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.phone.includes(searchTerm) ||
      customer.address.toLowerCase().includes(searchLower)
    )
  })

  const handleCustomerSelect = (customer: Customer) => {
    onCustomerSelect(customer)
    setOpen(false)
    setSearchTerm("")
  }

  const handleClearSelection = () => {
    onCustomerSelect(null)
    setOpen(false)
    setSearchTerm("")
  }

  return (
    <div className={className}>
      <Label htmlFor="customer-selection">Customer</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedCustomer ? (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="truncate">
                  {selectedCustomer.name} ({selectedCustomer.customer_id})
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <CommandList>
              {loading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading customers...
                </div>
              ) : filteredCustomers.length === 0 ? (
                <CommandEmpty>
                  {searchTerm ? "No customers found matching your search." : "No customers available."}
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredCustomers.map((customer) => (
                    <CommandItem
                      key={customer.id}
                      value={`${customer.name} ${customer.customer_id} ${customer.email} ${customer.phone}`}
                      onSelect={() => handleCustomerSelect(customer)}
                      className="flex items-center gap-2 p-3"
                    >
                      <Check
                        className={cn(
                          "h-4 w-4",
                          selectedCustomer?.id === customer.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{customer.name}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {customer.customer_id} • {customer.email}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {customer.phone} • {customer.address}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {customer.status === 'vip' ? 'VIP' : customer.status}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
            {selectedCustomer && (
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  className="w-full"
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
