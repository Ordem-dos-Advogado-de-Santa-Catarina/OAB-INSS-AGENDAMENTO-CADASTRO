import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Calendar, Clock, Loader2, Trash2, Plus, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function BlockManagement() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newBlock, setNewBlock] = useState({
    date: "",
    endDate: "",
    startTime: "08:00:00",
    endTime: "12:00:00",
    blockType: "full_day" as "full_day" | "time_slot" | "period",
    reason: ""
  });
  
  const blocksQuery = trpc.admin.getBlockedSlots.useQuery({});
  const createBlockMutation = trpc.admin.createBlock.useMutation();
  const deleteBlockMutation = trpc.admin.deleteBlock.useMutation();

  useEffect(() => {
    if (createBlockMutation.isSuccess) {
      toast.success("Bloqueio criado");
      blocksQuery.refetch();
      setIsAddOpen(false);
      setNewBlock({ date: "", endDate: "", startTime: "08:00:00", endTime: "12:00:00", blockType: "full_day", reason: "" });
    }
    if (createBlockMutation.isError) {
      toast.error(createBlockMutation.error.message || "Erro ao criar bloqueio");
    }
  }, [createBlockMutation.isSuccess, createBlockMutation.isError]);

  useEffect(() => {
    if (deleteBlockMutation.isSuccess) {
      toast.success("Bloqueio removido");
      blocksQuery.refetch();
    }
    if (deleteBlockMutation.isError) {
      toast.error(deleteBlockMutation.error.message || "Erro ao remover bloqueio");
    }
  }, [deleteBlockMutation.isSuccess, deleteBlockMutation.isError]);

  if (loading) return null;
  if (!user || user.role !== 'admin') {
    navigate("/dashboard");
    return null;
  }

  const handleCreate = () => {
    if (!newBlock.date || !newBlock.reason || (newBlock.blockType === "period" && !newBlock.endDate)) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    // Normalização das datas para evitar problemas de fuso horário
    const blockedDate = new Date(newBlock.date + 'T12:00:00');
    const endDate = newBlock.endDate ? new Date(newBlock.endDate + 'T12:00:00') : undefined;

    createBlockMutation.mutate({
      blockedDate,
      endDate,
      startTime: newBlock.blockType === "time_slot" ? newBlock.startTime : "00:00:00",
      endTime: newBlock.blockType === "time_slot" ? newBlock.endTime : "23:59:59",
      blockType: newBlock.blockType,
      reason: newBlock.reason
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Bloqueios</h1>
            <p className="text-gray-600 mt-1">Bloqueie datas ou horários específicos na agenda</p>
          </div>
          <Button onClick={() => setIsAddOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Novo Bloqueio
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bloqueios Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            {blocksQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : blocksQuery.data && blocksQuery.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">Data</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">Horário</th>
                      <th className="px-4 py-3">Motivo</th>
                      <th className="px-4 py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {blocksQuery.data.map((block: any) => (
                      <tr key={block.id} className="bg-white hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {block.blockedDate instanceof Date 
                            ? block.blockedDate.toLocaleDateString("pt-BR") 
                            : new Date(block.blockedDate).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-3">
                          {block.blockType === "full_day" ? "Dia Inteiro" : "Horário Específico"}
                        </td>
                        <td className="px-4 py-3">
                          {block.blockType === "full_day" ? "-" : `${block.startTime.substring(0, 5)} - ${block.endTime.substring(0, 5)}`}
                        </td>
                        <td className="px-4 py-3">{block.reason}</td>
                        <td className="px-4 py-3">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => deleteBlockMutation.mutate({ blockId: block.id })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Lock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhum bloqueio configurado.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Bloqueio de Agenda</DialogTitle>
            <DialogDescription>Preencha os dados para bloquear um período.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data {newBlock.blockType === "period" ? "Inicial" : ""}</label>
              <Input type="date" value={newBlock.date} onChange={(e) => setNewBlock({...newBlock, date: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Bloqueio</label>
              <Select value={newBlock.blockType} onValueChange={(val: any) => setNewBlock({...newBlock, blockType: val})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_day">Dia Único (Inteiro)</SelectItem>
                  <SelectItem value="time_slot">Horário Específico</SelectItem>
                  <SelectItem value="period">Período (Vários Dias)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newBlock.blockType === "period" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Final</label>
                <Input type="date" value={newBlock.endDate} onChange={(e) => setNewBlock({...newBlock, endDate: e.target.value})} />
              </div>
            )}
            {newBlock.blockType === "time_slot" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Início</label>
                  <Input type="time" value={newBlock.startTime} onChange={(e) => {
                    const val = e.target.value;
                    setNewBlock({...newBlock, startTime: val.length === 5 ? val + ':00' : val});
                  }} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fim</label>
                  <Input type="time" value={newBlock.endTime} onChange={(e) => {
                    const val = e.target.value;
                    setNewBlock({...newBlock, endTime: val.length === 5 ? val + ':00' : val});
                  }} />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo / Descrição</label>
              <Input placeholder="Ex: Feriado, Reunião Interna..." value={newBlock.reason} onChange={(e) => setNewBlock({...newBlock, reason: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={createBlockMutation.isPending} className="bg-indigo-600">
              {createBlockMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar Bloqueio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
