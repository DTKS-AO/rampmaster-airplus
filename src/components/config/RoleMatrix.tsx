import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useRoles, usePermissions } from '@/hooks/queries/useConfig'
import type { Role, Permission } from '@/types/config'

interface RoleMatrixProps {
  onTogglePermission: (roleId: string, permissionId: string, granted: boolean) => void
}

export function RoleMatrix({ onTogglePermission }: RoleMatrixProps) {
  const { data: roles, isLoading: isLoadingRoles } = useRoles()
  const { data: permissions, isLoading: isLoadingPermissions } = usePermissions()

  if (isLoadingRoles || isLoadingPermissions) {
    return <div>Carregando...</div>
  }

  const hasPermission = (role: Role, permissionId: string) => {
    return role.permissions?.some(p => p.id === permissionId)
  }

  const isSystemRole = (role: Role) => role.is_system

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matriz de Permissões</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recurso/Ação</TableHead>
                {roles?.map(role => (
                  <TableHead key={role.id} className="text-center">
                    {role.name}
                    {isSystemRole(role) && (
                      <Badge variant="secondary" className="ml-2">
                        Sistema
                      </Badge>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions?.map(permission => (
                <TableRow key={permission.id}>
                  <TableCell className="font-medium">
                    {permission.description}
                    <div className="text-sm text-muted-foreground">
                      {permission.resource}:{permission.action}
                    </div>
                  </TableCell>
                  {roles?.map(role => (
                    <TableCell key={role.id} className="text-center">
                      <Switch
                        checked={hasPermission(role, permission.id)}
                        onCheckedChange={(checked) =>
                          onTogglePermission(role.id, permission.id, checked)
                        }
                        disabled={isSystemRole(role)}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}