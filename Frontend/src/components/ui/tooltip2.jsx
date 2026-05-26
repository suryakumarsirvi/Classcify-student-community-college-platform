import * as TooltipPrimitive from '@radix-ui/react-tooltip'

export const Tooltip = ({ children, content, ...props }) => (
  <TooltipPrimitive.Root>
    <TooltipPrimitive.Trigger asChild>
      {children}
    </TooltipPrimitive.Trigger>
    <TooltipPrimitive.Content
      side="right"
      className="bg-gray-800 text-white px-2 py-1 rounded text-xs font-medium"
      {...props}
    >
      {content}
      <TooltipPrimitive.Arrow className="fill-gray-800" />
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Root>
)