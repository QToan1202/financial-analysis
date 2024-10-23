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
  isShowFooter?: boolean
}

const CustomTable = <TData extends RowData>({
  table,
  isShowFooter = false,
  ...rest
}: TableProps<TData>) => (
  <TableContainer {...rest}>
    <Table borderWidth="1px" variant="unstyled">
      <Thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <Tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <Th borderWidth="1px" key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </Th>
            ))}
          </Tr>
        ))}
      </Thead>
      <Tbody>
        {table.getRowModel().rows.map((row) => (
          <Tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <Td
                borderWidth="1px"
                key={cell.id}
                textAlign={
                  typeof cell.getValue() === 'number' ? 'end' : 'start'
                }
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
                <Th borderWidth="1px" key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext()
                      )}
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
