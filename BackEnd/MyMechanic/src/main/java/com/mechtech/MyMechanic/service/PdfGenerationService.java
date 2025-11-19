package com.mechtech.MyMechanic.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.mechtech.MyMechanic.entity.*;
import com.mechtech.MyMechanic.exception.PdfGenerationException;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;

@Service
public class PdfGenerationService {

    private static final Font FONT_TITULO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
    private static final Font FONT_SUBTITULO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
    private static final Font FONT_NORMAL = FontFactory.getFont(FontFactory.HELVETICA, 10);
    private static final Font FONT_BOLD = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);

    public byte[] generateInvoicePdf(Invoice invoice) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, baos);
            document.open();

            //  Cabeçalho
            document.add(new Paragraph("Fatura", FONT_TITULO));
            document.add(new Paragraph("Número da Fatura: " + invoice.getInvoiceNumber(), FONT_BOLD));
            document.add(new Paragraph("Data de Emissão: " + invoice.getIssueDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), FONT_NORMAL));
            document.add(new Paragraph(" ")); // Linha em branco

            //  Informações do Cliente e Veículo
            addClientAndVehicleInfo(document, invoice);
            document.add(new Paragraph(" "));

            //  Tabela de Serviços
            document.add(new Paragraph("Serviços Prestados", FONT_SUBTITULO));
            document.add(createServicesTable(invoice));
            document.add(new Paragraph(" "));

            //  Tabela de Peças
            document.add(new Paragraph("Peças Utilizadas", FONT_SUBTITULO));
            document.add(createPartsTable(invoice));
            document.add(new Paragraph(" "));

            //  Total
            Paragraph total = new Paragraph("Total: R$ " + invoice.getTotalAmount(), FONT_TITULO);
            total.setAlignment(Element.ALIGN_RIGHT);
            document.add(total);

            document.close();
            return baos.toByteArray();
        } catch (DocumentException | IOException e) {
            throw new PdfGenerationException(e);
        }
    }

    private void addClientAndVehicleInfo(Document document, Invoice invoice) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);

        // Célula do Cliente
        PdfPCell clientCell = new PdfPCell();
        clientCell.setBorder(Rectangle.NO_BORDER);
        clientCell.addElement(new Paragraph("Cliente:", FONT_SUBTITULO));
        clientCell.addElement(new Paragraph(invoice.getServiceOrder().getClient().getName(), FONT_NORMAL));
        // Adicione mais detalhes do cliente se desejar (morada, telefone, etc.)

        // Célula do Veículo
        PdfPCell vehicleCell = new PdfPCell();
        vehicleCell.setBorder(Rectangle.NO_BORDER);
        vehicleCell.addElement(new Paragraph("Veículo:", FONT_SUBTITULO));
        String vehicleInfo = String.format("%s %s - Matrícula: %s",
                invoice.getServiceOrder().getVehicle().getBrand(),
                invoice.getServiceOrder().getVehicle().getModel(),
                invoice.getServiceOrder().getVehicle().getLicensePlate());
        vehicleCell.addElement(new Paragraph(vehicleInfo, FONT_NORMAL));

        table.addCell(clientCell);
        table.addCell(vehicleCell);
        document.add(table);
    }

    private PdfPTable createServicesTable(Invoice invoice) {
        PdfPTable table = new PdfPTable(2); // 2 colunas: Descrição, Custo
        table.setWidthPercentage(100);

        // Cabeçalho da tabela
        table.addCell(new PdfPCell(new Phrase("Serviço", FONT_BOLD)));
        table.addCell(new PdfPCell(new Phrase("Custo (R$)", FONT_BOLD)));

        // Itens
        for (ServiceOrderServiceItem item : invoice.getServiceOrder().getServiceItems()) {
            table.addCell(new PdfPCell(new Phrase(item.getRepairService().getName(), FONT_NORMAL)));
            table.addCell(new PdfPCell(new Phrase(item.getServiceCost().toString(), FONT_NORMAL)));
        }
        return table;
    }

    private PdfPTable createPartsTable(Invoice invoice) {
        PdfPTable table = new PdfPTable(4); // 4 colunas: Peça, Qtd, Preço Unit., Total
        table.setWidthPercentage(100);

        // Cabeçalho da tabela
        table.addCell(new PdfPCell(new Phrase("Peça", FONT_BOLD)));
        table.addCell(new PdfPCell(new Phrase("Quantidade", FONT_BOLD)));
        table.addCell(new PdfPCell(new Phrase("Preço Unit. (R$)", FONT_BOLD)));
        table.addCell(new PdfPCell(new Phrase("Total (R$)", FONT_BOLD)));

        // Itens
        for (ServiceOrderPartItem item : invoice.getServiceOrder().getPartItems()) {
            table.addCell(new PdfPCell(new Phrase(item.getPart().getName(), FONT_NORMAL)));
            table.addCell(new PdfPCell(new Phrase(item.getQuantity().toString(), FONT_NORMAL)));
            table.addCell(new PdfPCell(new Phrase(item.getUnitPrice().toString(), FONT_NORMAL)));
            // Calcula o total do item
            table.addCell(new PdfPCell(new Phrase(item.getUnitPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())).toString(), FONT_NORMAL)));
        }
        return table;
    }

    public byte[] generateQuotationPdf(Quotation quotation) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, baos);
            document.open();

            // Cabeçalho
            document.add(new Paragraph("Orçamento", FONT_TITULO));
            document.add(new Paragraph("Número do Orçamento: " + quotation.getId(), FONT_BOLD));
            document.add(new Paragraph("Data de Emissão: " + quotation.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), FONT_NORMAL));
            document.add(new Paragraph(" ")); // Linha em branco

            // Informações do Cliente e Veículo
            addClientAndVehicleInfo(document, quotation);
            document.add(new Paragraph(" "));

            // Tabela de Serviços
            document.add(new Paragraph("Serviços Propostos", FONT_SUBTITULO));
            document.add(createQuotationServicesTable(quotation));
            document.add(new Paragraph(" "));

            // Tabela de Peças
            document.add(new Paragraph("Peças Orçadas", FONT_SUBTITULO));
            document.add(createQuotationPartsTable(quotation));
            document.add(new Paragraph(" "));

            // Total
            Paragraph total = new Paragraph("Total: R$ " + quotation.getTotalCost(), FONT_TITULO);
            total.setAlignment(Element.ALIGN_RIGHT);
            document.add(total);

            // Adiciona a área de assinatura
            addSignatureArea(document); // Adicione esta linha

            document.close();
            return baos.toByteArray();
        } catch (DocumentException | IOException e) {
            throw new PdfGenerationException(e);
        }
    }

    private void addClientAndVehicleInfo(Document document, Quotation quotation) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);

        // Célula do Cliente
        PdfPCell clientCell = new PdfPCell();
        clientCell.setBorder(Rectangle.NO_BORDER);
        clientCell.addElement(new Paragraph("Cliente:", FONT_SUBTITULO));
        clientCell.addElement(new Paragraph(quotation.getClient().getName(), FONT_NORMAL));

        // Célula do Veículo
        PdfPCell vehicleCell = new PdfPCell();
        vehicleCell.setBorder(Rectangle.NO_BORDER);
        vehicleCell.addElement(new Paragraph("Veículo:", FONT_SUBTITULO));
        String vehicleInfo = String.format("%s %s - Matrícula: %s",
                quotation.getVehicle().getBrand(),
                quotation.getVehicle().getModel(),
                quotation.getVehicle().getLicensePlate());
        vehicleCell.addElement(new Paragraph(vehicleInfo, FONT_NORMAL));

        table.addCell(clientCell);
        table.addCell(vehicleCell);
        document.add(table);
    }

    private PdfPTable createQuotationServicesTable(Quotation quotation) {
        PdfPTable table = new PdfPTable(2); // 2 colunas: Descrição, Custo
        table.setWidthPercentage(100);

        // Cabeçalho da tabela
        table.addCell(new PdfPCell(new Phrase("Serviço", FONT_BOLD)));
        table.addCell(new PdfPCell(new Phrase("Custo (R$)", FONT_BOLD)));

        // Itens
        for (QuotationServiceItem item : quotation.getServiceItems()) {
            table.addCell(new PdfPCell(new Phrase(item.getRepairService().getName(), FONT_NORMAL)));
            table.addCell(new PdfPCell(new Phrase(item.getServiceCost().toString(), FONT_NORMAL)));
        }
        return table;
    }

    private PdfPTable createQuotationPartsTable(Quotation quotation) {
        PdfPTable table = new PdfPTable(4); // 4 colunas: Peça, Qtd, Preço Unit., Total
        table.setWidthPercentage(100);

        // Cabeçalho da tabela
        table.addCell(new PdfPCell(new Phrase("Peça", FONT_BOLD)));
        table.addCell(new PdfPCell(new Phrase("Quantidade", FONT_BOLD)));
        table.addCell(new PdfPCell(new Phrase("Preço Unit. (R$)", FONT_BOLD)));
        table.addCell(new PdfPCell(new Phrase("Total (R$)", FONT_BOLD)));

        // Itens
        for (QuotationPartItem item : quotation.getPartItems()) {
            table.addCell(new PdfPCell(new Phrase(item.getPart().getName(), FONT_NORMAL)));
            table.addCell(new PdfPCell(new Phrase(item.getQuantity().toString(), FONT_NORMAL)));
            table.addCell(new PdfPCell(new Phrase(item.getUnitPrice().toString(), FONT_NORMAL)));
            // Calcula o total do item
            table.addCell(new PdfPCell(new Phrase(item.getUnitPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())).toString(), FONT_NORMAL)));
        }
        return table;
    }

    private void addSignatureArea(Document document) throws DocumentException {
        // Adiciona um espaço antes da seção de assinaturas
        document.add(new Paragraph(" "));
        document.add(new Paragraph(" "));
        document.add(new Paragraph(" "));

        // Cria uma tabela para alinhar as assinaturas
        PdfPTable signatureTable = new PdfPTable(2);
        signatureTable.setWidthPercentage(100);

        // Célula para a assinatura da empresa
        PdfPCell companySignatureCell = new PdfPCell();
        companySignatureCell.setBorder(Rectangle.NO_BORDER);
        companySignatureCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        companySignatureCell.addElement(new Paragraph("_________________________"));
        companySignatureCell.addElement(new Paragraph("Assinatura do Responsável", FONT_NORMAL));

        // Célula para a assinatura do cliente
        PdfPCell clientSignatureCell = new PdfPCell();
        clientSignatureCell.setBorder(Rectangle.NO_BORDER);
        clientSignatureCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        clientSignatureCell.addElement(new Paragraph("_________________________"));
        clientSignatureCell.addElement(new Paragraph("Assinatura do Cliente", FONT_NORMAL));

        signatureTable.addCell(companySignatureCell);
        signatureTable.addCell(clientSignatureCell);

        document.add(signatureTable);
    }

    public byte[] generateServiceOrderPdf(ServiceOrder serviceOrder) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, baos);
            document.open();

            // Cabeçalho
            document.add(new Paragraph("Ordem de Serviço", FONT_TITULO));
            document.add(new Paragraph("ID da Ordem: " + serviceOrder.getId(), FONT_BOLD));
            document.add(new Paragraph("Status: " + serviceOrder.getStatus().name(), FONT_BOLD));
            document.add(new Paragraph("Data de Entrada: " + serviceOrder.getEntryDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), FONT_NORMAL));
            if (serviceOrder.getExitDate() != null) {
                document.add(new Paragraph("Data de Saída: " + serviceOrder.getExitDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), FONT_NORMAL));
            }
            document.add(new Paragraph("Descrição do Serviço: " + serviceOrder.getDescription(), FONT_NORMAL));
            document.add(new Paragraph(" ")); // Linha em branco

            // Informações do Cliente e Veículo
            addServiceOrderClientAndVehicleInfo(document, serviceOrder);
            document.add(new Paragraph(" "));

            // Tabela de Serviços
            document.add(new Paragraph("Serviços Executados", FONT_SUBTITULO));
            document.add(createServiceOrderServicesTable(serviceOrder));
            document.add(new Paragraph(" "));

            // Tabela de Peças
            document.add(new Paragraph("Peças Utilizadas", FONT_SUBTITULO));
            document.add(createServiceOrderPartsTable(serviceOrder));
            document.add(new Paragraph(" "));

            // Tabela de Mão de Obra
            document.add(new Paragraph("Equipe e Mão de Obra", FONT_SUBTITULO));
            document.add(createServiceOrderEmployeesTable(serviceOrder));
            document.add(new Paragraph(" "));

            // Total
            Paragraph total = new Paragraph("Custo Total Estimado: R$ " + serviceOrder.getTotalCost(), FONT_TITULO);
            total.setAlignment(Element.ALIGN_RIGHT);
            document.add(total);

            // Adiciona a área de assinatura
            addSignatureArea(document);

            document.close();
            return baos.toByteArray();
        } catch (DocumentException | IOException e) {
            throw new PdfGenerationException(e);
        }
    }

    // MÉTODOS AUXILIARES PARA ORDEM DE SERVIÇO

    private void addServiceOrderClientAndVehicleInfo(Document document, ServiceOrder serviceOrder) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);

        // Célula do Cliente
        PdfPCell clientCell = new PdfPCell();
        clientCell.setBorder(Rectangle.NO_BORDER);
        clientCell.addElement(new Paragraph("Cliente:", FONT_SUBTITULO));
        clientCell.addElement(new Paragraph(serviceOrder.getClient().getName(), FONT_NORMAL));

        // Célula do Veículo
        PdfPCell vehicleCell = new PdfPCell();
        vehicleCell.setBorder(Rectangle.NO_BORDER);
        vehicleCell.addElement(new Paragraph("Veículo:", FONT_SUBTITULO));
        String vehicleInfo = String.format("%s %s - Matrícula: %s",
                serviceOrder.getVehicle().getBrand(),
                serviceOrder.getVehicle().getModel(),
                serviceOrder.getVehicle().getLicensePlate());
        vehicleCell.addElement(new Paragraph(vehicleInfo, FONT_NORMAL));

        table.addCell(clientCell);
        table.addCell(vehicleCell);
        document.add(table);
    }

    private PdfPTable createServiceOrderServicesTable(ServiceOrder serviceOrder) {
        PdfPTable table = new PdfPTable(2); // 2 colunas: Descrição, Custo
        table.setWidthPercentage(100);

        // Cabeçalho da tabela
        table.addCell(new PdfPCell(new Phrase("Serviço", FONT_BOLD)));
        table.addCell(new PdfPCell(new Phrase("Custo (R$)", FONT_BOLD)));

        // Itens
        if (serviceOrder.getServiceItems() != null) {
            for (ServiceOrderServiceItem item : serviceOrder.getServiceItems()) {
                table.addCell(new PdfPCell(new Phrase(item.getRepairService().getName(), FONT_NORMAL)));
                table.addCell(new PdfPCell(new Phrase(item.getServiceCost().toString(), FONT_NORMAL)));
            }
        }
        return table;
    }

    private PdfPTable createServiceOrderPartsTable(ServiceOrder serviceOrder) {
        PdfPTable table = new PdfPTable(4); // 4 colunas: Peça, Qtd, Preço Unit., Total
        table.setWidthPercentage(100);

        // Cabeçalho da tabela
        table.addCell(new PdfPCell(new Phrase("Peça", FONT_BOLD)));
        table.addCell(new PdfPCell(new Phrase("Quantidade", FONT_BOLD)));
        table.addCell(new PdfPCell(new Phrase("Preço Unit. (R$)", FONT_BOLD)));
        table.addCell(new PdfPCell(new Phrase("Total (R$)", FONT_BOLD)));

        // Itens
        if (serviceOrder.getPartItems() != null) {
            for (ServiceOrderPartItem item : serviceOrder.getPartItems()) {
                table.addCell(new PdfPCell(new Phrase(item.getPart().getName(), FONT_NORMAL)));
                table.addCell(new PdfPCell(new Phrase(item.getQuantity().toString(), FONT_NORMAL)));
                table.addCell(new PdfPCell(new Phrase(item.getUnitPrice().toString(), FONT_NORMAL)));
                // Calcula o total do item
                table.addCell(new PdfPCell(new Phrase(item.getUnitPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())).toString(), FONT_NORMAL)));
            }
        }
        return table;
    }

    private PdfPTable createServiceOrderEmployeesTable(ServiceOrder serviceOrder) {
        PdfPTable table = new PdfPTable(3); // 3 colunas: Funcionário, % Comissão, Horas Trabalhadas
        table.setWidthPercentage(100);

        // Cabeçalho da tabela
        table.addCell(new PdfPCell(new Phrase("Funcionário", FONT_BOLD)));
        table.addCell(new PdfPCell(new Phrase("% Comissão", FONT_BOLD)));
        table.addCell(new PdfPCell(new Phrase("Horas Trabalhadas", FONT_BOLD)));

        // Itens
        if (serviceOrder.getEmployees() != null) {
            for (ServiceOrderEmployee item : serviceOrder.getEmployees()) {
                table.addCell(new PdfPCell(new Phrase(item.getEmployee().getName(), FONT_NORMAL)));
                table.addCell(new PdfPCell(new Phrase(item.getCommissionPercentage() + "%", FONT_NORMAL)));
                table.addCell(new PdfPCell(new Phrase(item.getWorkedHours() != null ? item.getWorkedHours().toString() : "N/A", FONT_NORMAL)));
            }
        }
        return table;
    }
}