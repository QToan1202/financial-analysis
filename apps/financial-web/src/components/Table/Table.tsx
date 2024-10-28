import {
  TableContainer,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Tfoot,
  Table,
  TableContainerProps,
  TableProps as ChakraTableProps,
} from '@chakra-ui/react'
import { flexRender } from '@tanstack/react-table'
import type { RowData, Table as TableDataType } from '@tanstack/react-table'

export type TableProps<TData extends RowData> = TableContainerProps & {
  table: TableDataType<TData>
  variant?: ChakraTableProps['variant']
  fullBorder?: boolean
  isShowHeader?: boolean
  isShowFooter?: boolean
}

const CustomTable = <TData extends RowData>({
  table,
  variant = 'unstyled',
  fullBorder = true,
  isShowHeader = true,
  isShowFooter = false,
  ...rest
}: TableProps<TData>) => (
  <TableContainer {...rest}>
    <Table variant={variant} width="100%" {...(fullBorder && { borderWidth: '1px' })}>
      {isShowHeader && (
        <Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Th key={header.id} {...(fullBorder && { borderWidth: '1px' })}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>
      )}
      <Tbody>
        {table.getRowModel().rows.map((row) => (
          <Tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <Td
                key={cell.id}
                textAlign={typeof cell.getValue() === 'number' ? 'end' : 'start'}
                isTruncated
                maxW={cell.column.columnDef.maxSize}
                {...(fullBorder && { borderWidth: '1px' })}
              >
                {cell.getIsPlaceholder()
                  ? null
                  : flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Td>
            ))}
          </Tr>
        ))}
      </Tbody>
      {isShowFooter && (
        <Tfoot>
          {table.getFooterGroups().map((footerGroup) => (
            <Tr key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <Th key={header.id} {...(fullBorder && { borderWidth: '1px' })}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.footer, header.getContext())}
                </Th>
              ))}
            </Tr>
          ))}
        </Tfoot>
      )}
    </Table>
  </TableContainer>
)

export default CustomTable
