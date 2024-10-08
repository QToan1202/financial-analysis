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
} from '@chakra-ui/react'
import { flexRender } from '@tanstack/react-table'
import type { RowData, Table as TableDataType } from '@tanstack/react-table'

export type TableProps<TData extends RowData> = TableContainerProps & {
  table: TableDataType<TData>
}

const CustomTable = <TData extends RowData>({ table, ...rest }: TableProps<TData>) => (
  <TableContainer {...rest}>
    <Table variant="simple">
      <Thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <Tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <Th key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </Th>
            ))}
          </Tr>
        ))}
      </Thead>
      <Tbody>
        {table.getRowModel().rows.map((row) => (
          <Tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <Td key={cell.id}>
                {cell.getIsPlaceholder()
                  ? null
                  : flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Td>
            ))}
          </Tr>
        ))}
      </Tbody>
      <Tfoot>
        {table.getFooterGroups().map((footerGroup) => (
          <Tr key={footerGroup.id}>
            {footerGroup.headers.map((header) => (
              <Th key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.footer, header.getContext())}
              </Th>
            ))}
          </Tr>
        ))}
      </Tfoot>
    </Table>
  </TableContainer>
)

export default CustomTable
