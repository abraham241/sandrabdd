import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import React, { ReactNode } from 'react'

type sectionPrpos = {
    className?: string,
    children: ReactNode
}

const Section:React.FC<sectionPrpos> = ({className, children}) => {
  return (
    <Card className={cn(className)}>
        {children}
    </Card>
  )
}

export default Section