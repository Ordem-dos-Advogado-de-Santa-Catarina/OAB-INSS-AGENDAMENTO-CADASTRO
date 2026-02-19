import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, CheckCircle2, Loader2, Upload, AlertCircle, Info } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function TCMSUpdateForm() {
    const { user, loading } = useAuth();
    const [, navigate] = useLocation();

    const [formData, setFormData] = useState({
        name: "",
        cpf: "",
        email: "",
        oab: "",
        phone: "",
        description: ""
    });

    const [attachments, setAttachments] = useState<{ file: File, type: string }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const createFormMutation = trpc.forms.create.useMutation();
    const uploadFileMutation = trpc.forms.uploadFile.useMutation();
    const submitFormMutation = trpc.forms.submit.useMutation();

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || "",
                cpf: user.cpf || "",
                email: user.email || "",
                oab: user.oab || "",
                phone: user.phone || ""
            }));
        }
    }, [user]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
            </DashboardLayout>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAttachments(prev => {
                const filtered = prev.filter(a => a.type !== type);
                return [...filtered, { file, type }];
            });
            toast.success(`Arquivo selecionado com sucesso.`);
        }
    };

    const handleSubmit = async () => {
        if (!formData.description) {
            toast.error("Por favor, descreva o que deseja atualizar.");
            return;
        }

        if (attachments.length === 0) {
            toast.error("Por favor, anexe ao menos um documento comprobatório.");
            return;
        }

        setIsSubmitting(true);
        try {
            const form = await createFormMutation.mutateAsync({
                ...formData,
                formType: "tcms_update"
            });
            const formId = form.id;

            for (const att of attachments) {
                const fileContent = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const result = reader.result as string;
                        resolve(result.split(',')[1]);
                    };
                    reader.onerror = () => reject(new Error("Erro na leitura do arquivo"));
                    reader.readAsDataURL(att.file);
                });

                await uploadFileMutation.mutateAsync({
                    formId,
                    fileName: att.file.name,
                    fileContent,
                    fileType: att.type,
                    contentType: att.file.type || 'application/pdf'
                });
            }

            await submitFormMutation.mutateAsync({ id: formId });

            toast.success("Solicitação TCMS enviada com sucesso!");
            navigate("/forms/status");
        } catch (error: any) {
            toast.error(`Erro ao enviar: ${error.message || "Erro desconhecido"}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Solicitação de Atualização TCMS</h1>
                    <p className="text-gray-600 mt-1">Utilize este canal para solicitar atualizações cadastrais ou envio de documentos complementares.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Dados do Solicitante</CardTitle>
                        <CardDescription>Confirme seus dados básicos de identificação.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nome</Label>
                            <Input value={formData.name} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                            <Label>CPF</Label>
                            <Input value={formData.cpf} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                            <Label>E-mail</Label>
                            <Input value={formData.email} readOnly className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                            <Label>OAB</Label>
                            <Input value={formData.oab} readOnly className="bg-gray-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Detalhes da Solicitação</CardTitle>
                        <CardDescription>Descreva o que precisa ser atualizado e anexe os documentos.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição da Atualização</Label>
                            <Textarea
                                id="description"
                                placeholder="Exemplo: Preciso atualizar meu endereço e enviar nova certidão negativa..."
                                className="min-h-32"
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <Label className="text-lg font-semibold">Documentação Comprobatória</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Documento Principal (PDF)</Label>
                                    <div className="flex items-center gap-3">
                                        <Input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, "tcms_main_doc")} />
                                        {attachments.some(a => a.type === "tcms_main_doc") && <CheckCircle2 className="text-green-500 h-5 w-5" />}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Anexo Adicional (Opcional)</Label>
                                    <div className="flex items-center gap-3">
                                        <Input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, "tcms_extra_doc")} />
                                        {attachments.some(a => a.type === "tcms_extra_doc") && <CheckCircle2 className="text-green-500 h-5 w-5" />}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Alert className="bg-indigo-50 border-indigo-200 mt-6">
                            <Info className="h-4 w-4 text-indigo-600" />
                            <AlertDescription className="text-indigo-900 text-xs">
                                Sua solicitação será analisada pela equipe técnica da OAB/SC. Você poderá acompanhar o status na aba de Histórico.
                            </AlertDescription>
                        </Alert>

                        <div className="pt-6 flex justify-end">
                            <Button
                                onClick={handleSubmit}
                                className="bg-indigo-600 hover:bg-indigo-700"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                                Enviar Solicitação
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
