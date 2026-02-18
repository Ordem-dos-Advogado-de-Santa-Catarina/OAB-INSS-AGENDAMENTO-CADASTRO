import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Mail, Save, Loader2, Info, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function EmailSettings() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("");
  const [templates, setTemplates] = useState<any[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<any>(null);

  const templatesQuery = trpc.admin.getEmailTemplates.useQuery();

  useEffect(() => {
    if (templatesQuery.data) {
      setTemplates(templatesQuery.data);
      if (templatesQuery.data.length > 0 && !activeTab) {
        setActiveTab(templatesQuery.data[0].slug);
        setCurrentTemplate(templatesQuery.data[0]);
      }
    }
  }, [templatesQuery.data]);

  const saveMutation = trpc.admin.saveEmailTemplate.useMutation({
    onSuccess: () => {
      toast.success("Modelo de e-mail salvo com sucesso!");
      templatesQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao salvar modelo");
    }
  });

  useEffect(() => {
    if (activeTab) {
      const template = templates.find(t => t.slug === activeTab);
      if (template) {
        setCurrentTemplate({ ...template });
      }
    }
  }, [activeTab, templates]);

  if (loading) return null;
  if (!user || user.role !== 'admin') {
    navigate("/dashboard");
    return null;
  }

  const handleSave = () => {
    if (!currentTemplate) return;
    saveMutation.mutate({
      slug: currentTemplate.slug,
      name: currentTemplate.name,
      subject: currentTemplate.subject,
      body: currentTemplate.body,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Modelos de E-mail</h1>
          <p className="text-gray-600 mt-1">Personalize as mensagens enviadas automaticamente pelo sistema</p>
        </div>

        {templatesQuery.isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : templates.length > 0 ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-white border p-1 h-auto flex-wrap justify-start">
              {templates.map((t) => (
                <TabsTrigger 
                  key={t.slug} 
                  value={t.slug}
                  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                >
                  {t.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {templates.map((t) => (
              <TabsContent key={t.slug} value={t.slug}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-indigo-600" />
                      Editar: {t.name}
                    </CardTitle>
                    <CardDescription>
                      Use as variáveis indicadas para personalizar o conteúdo dinamicamente.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Assunto do E-mail</label>
                      <Input 
                        value={currentTemplate?.subject || ""} 
                        onChange={(e) => setCurrentTemplate({...currentTemplate, subject: e.target.value})}
                        placeholder="Assunto da mensagem"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Corpo do E-mail (HTML permitido)</label>
                      <Textarea 
                        value={currentTemplate?.body || ""} 
                        onChange={(e) => setCurrentTemplate({...currentTemplate, body: e.target.value})}
                        className="min-h-[400px] font-mono text-sm"
                        placeholder="Conteúdo do e-mail em HTML"
                      />
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertTitle className="text-blue-800 text-sm font-bold">Variáveis Disponíveis</AlertTitle>
                      <AlertDescription className="text-blue-700 text-xs mt-1">
                        {t.slug === 'appointment_confirmation' && (
                          <p>Use: <strong>{`{userName}`}</strong>, <strong>{`{appointmentDate}`}</strong>, <strong>{`{startTime}`}</strong>, <strong>{`{endTime}`}</strong>, <strong>{`{reason}`}</strong></p>
                        )}
                        {t.slug === 'appointment_cancellation' && (
                          <p>Use: <strong>{`{userName}`}</strong>, <strong>{`{appointmentDate}`}</strong>, <strong>{`{startTime}`}</strong>, <strong>{`{reason}`}</strong></p>
                        )}
                        {t.slug === 'custom_notification' && (
                          <p>Use: <strong>{`{userName}`}</strong>, <strong>{`{message}`}</strong></p>
                        )}
                      </AlertDescription>
                    </Alert>

                    <div className="flex justify-end">
                      <Button 
                        onClick={handleSave} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        disabled={saveMutation.isPending}
                      >
                        {saveMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Salvar Modelo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Nenhum modelo encontrado</AlertTitle>
            <AlertDescription>
              Não foi possível carregar os modelos de e-mail do banco de dados.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  );
}
