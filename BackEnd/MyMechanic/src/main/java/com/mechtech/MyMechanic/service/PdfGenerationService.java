package com.mechtech.MyMechanic.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfWriter;
import com.mechtech.MyMechanic.entity.*;
import com.mechtech.MyMechanic.exception.PdfGenerationException;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
public class PdfGenerationService {

    // Cores
    private static final Color COLOR_PRIMARY = new Color(0, 51, 102); // Azul Escuro
    private static final Color COLOR_LIGHT_GRAY = new Color(240, 240, 240);

    // Fontes
    private static final Font FONT_TITULO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, COLOR_PRIMARY);
    private static final Font FONT_SUBTITULO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, COLOR_PRIMARY);
    private static final Font FONT_NORMAL = FontFactory.getFont(FontFactory.HELVETICA, 10);
    private static final Font FONT_BOLD = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
    private static final Font FONT_HEADER_TABLE = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);

    // Classe interna para o rodapé
    private static class FooterPageEvent extends PdfPageEventHelper {
        private final Tenant tenant;

        public FooterPageEvent(Tenant tenant) {
            this.tenant = tenant;
        }

        public void onEndPage(PdfWriter writer, Document document) {
            PdfPTable footer = new PdfPTable(1);
            footer.setTotalWidth(document.getPageSize().getWidth() - document.leftMargin() - document.rightMargin());
            PdfPCell cell = new PdfPCell(new Phrase(String.format("%s | Página %d", tenant.getName(), writer.getPageNumber()), FONT_NORMAL));
            cell.setBorder(Rectangle.TOP);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            footer.addCell(cell);
            footer.writeSelectedRows(0, -1, document.leftMargin(), document.bottom(), writer.getDirectContent());
        }
    }

    private void addCompanyHeader(Document document, Tenant tenant) throws DocumentException, IOException {
        if (tenant == null) return;

        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{1, 3});

        // Célula do Logo
        PdfPCell logoCell = new PdfPCell();
        logoCell.setBorder(Rectangle.NO_BORDER);
        if (tenant.getLogo() != null && tenant.getLogo().length > 0) {
            try {
                Image logo = Image.getInstance(tenant.getLogo());
                logo.scaleToFit(80, 80);
                logoCell.addElement(logo);
            } catch (BadElementException | IOException e) {
                logoCell.addElement(new Paragraph("Logo", FONT_NORMAL));
            }
        }
        headerTable.addCell(logoCell);

        // Célula de Informações da Empresa
        PdfPCell textCell = new PdfPCell();
        textCell.setBorder(Rectangle.NO_BORDER);
        textCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        Paragraph companyInfo = new Paragraph();
        companyInfo.setAlignment(Element.ALIGN_RIGHT);
        companyInfo.add(new Chunk(tenant.getName() + "\n", FONT_SUBTITULO));
        companyInfo.add(new Chunk("Documento: " + tenant.getDocument() + "\n", FONT_NORMAL));
        companyInfo.add(new Chunk("Telefone: " + tenant.getPhone() + "\n", FONT_NORMAL));
        if (tenant.getEmail() != null) {
            companyInfo.add(new Chunk(tenant.getEmail(), FONT_NORMAL));
        }
        textCell.addElement(companyInfo);
        headerTable.addCell(textCell);

        document.add(headerTable);
        document.add(new Paragraph(" ")); // Espaçador
    }

    private PdfPCell createHeaderCell(String text, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FONT_HEADER_TABLE));
        cell.setBackgroundColor(COLOR_PRIMARY);
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(8);
        cell.setBorder(Rectangle.NO_BORDER);
        return cell;
    }

    private PdfPCell createDataCell(String text, int alignment, boolean isEven) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FONT_NORMAL));
        cell.setHorizontalAlignment(alignment);
        cell.setPadding(6);
        cell.setBorder(Rectangle.NO_BORDER);
        if (isEven) {
            cell.setBackgroundColor(COLOR_LIGHT_GRAY);
        }
        return cell;
    }

    public byte[] generateInvoicePdf(Invoice invoice) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter writer = PdfWriter.getInstance(document, baos);
            writer.setPageEvent(new FooterPageEvent(invoice.getTenant()));
            document.open();

            addCompanyHeader(document, invoice.getTenant());

            document.add(new Paragraph("Fatura", FONT_TITULO));
            document.add(new Paragraph("Número da Fatura: " + invoice.getInvoiceNumber(), FONT_BOLD));
            document.add(new Paragraph("Data de Emissão: " + invoice.getIssueDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), FONT_NORMAL));
            document.add(new Paragraph(" "));

            addClientAndVehicleInfo(document, invoice);
            document.add(new Paragraph(" "));

            Paragraph servicesTitle = new Paragraph("Serviços Prestados", FONT_SUBTITULO);
            servicesTitle.setSpacingAfter(10f);
            document.add(servicesTitle);
            document.add(createServicesTable(invoice));
            document.add(new Paragraph(" "));

            Paragraph partsTitle = new Paragraph("Peças Utilizadas", FONT_SUBTITULO);
            partsTitle.setSpacingAfter(10f);
            document.add(partsTitle);
            document.add(createPartsTable(invoice));
            document.add(new Paragraph(" "));

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
        addClientAndVehicleInfo(document, invoice.getServiceOrder().getClient(), invoice.getServiceOrder().getVehicle());
    }

    private void addClientAndVehicleInfo(Document document, Quotation quotation) throws DocumentException {
        addClientAndVehicleInfo(document, quotation.getClient(), quotation.getVehicle());
    }
    
    private void addServiceOrderClientAndVehicleInfo(Document document, ServiceOrder serviceOrder) throws DocumentException {
        addClientAndVehicleInfo(document, serviceOrder.getClient(), serviceOrder.getVehicle());
    }

    private void addClientAndVehicleInfo(Document document, Client client, Vehicle vehicle) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);

        PdfPCell clientCell = new PdfPCell();
        clientCell.setBorder(Rectangle.NO_BORDER);
        clientCell.addElement(new Paragraph("Cliente:", FONT_SUBTITULO));
        clientCell.addElement(new Paragraph(client.getName(), FONT_NORMAL));
        clientCell.addElement(new Paragraph(client.getEmail(), FONT_NORMAL));
        clientCell.addElement(new Paragraph(client.getPhone(), FONT_NORMAL));


        PdfPCell vehicleCell = new PdfPCell();
        vehicleCell.setBorder(Rectangle.NO_BORDER);
        vehicleCell.addElement(new Paragraph("Veículo:", FONT_SUBTITULO));
        String vehicleInfo = String.format("%s %s - Placa: %s",
                vehicle.getModel().getBrand().getName(),
                vehicle.getModel().getName(),
                vehicle.getLicensePlate());
        vehicleCell.addElement(new Paragraph(vehicleInfo, FONT_NORMAL));

        table.addCell(clientCell);
        table.addCell(vehicleCell);
        document.add(table);
    }

    private PdfPTable createServicesTable(Invoice invoice) {
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.addCell(createHeaderCell("Serviço", Element.ALIGN_LEFT));
        table.addCell(createHeaderCell("Qtd.", Element.ALIGN_CENTER));
        table.addCell(createHeaderCell("Valor Unit. (R$)", Element.ALIGN_RIGHT));
        table.addCell(createHeaderCell("Total (R$)", Element.ALIGN_RIGHT));

        boolean even = false;
        for (ServiceOrderServiceItem item : invoice.getServiceOrder().getServiceItems()) {
            table.addCell(createDataCell(item.getRepairService().getName(), Element.ALIGN_LEFT, even));
            table.addCell(createDataCell(String.valueOf(item.getQuantity()), Element.ALIGN_CENTER, even));
            table.addCell(createDataCell("R$ " + item.getServiceCost().toString(), Element.ALIGN_RIGHT, even));
            BigDecimal total = item.getServiceCost().multiply(BigDecimal.valueOf(item.getQuantity()));
            table.addCell(createDataCell("R$ " + total.toString(), Element.ALIGN_RIGHT, even));
            even = !even;
        }
        return table;
    }

    private PdfPTable createPartsTable(Invoice invoice) {
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.addCell(createHeaderCell("Peça", Element.ALIGN_LEFT));
        table.addCell(createHeaderCell("Qtd.", Element.ALIGN_CENTER));
        table.addCell(createHeaderCell("Preço Unit. (R$)", Element.ALIGN_RIGHT));
        table.addCell(createHeaderCell("Total (R$)", Element.ALIGN_RIGHT));

        boolean even = false;
        for (ServiceOrderPartItem item : invoice.getServiceOrder().getPartItems()) {
            table.addCell(createDataCell(item.getPart().getName(), Element.ALIGN_LEFT, even));
            table.addCell(createDataCell(item.getQuantity().toString(), Element.ALIGN_CENTER, even));
            table.addCell(createDataCell("R$ " + item.getUnitPrice().toString(), Element.ALIGN_RIGHT, even));
            table.addCell(createDataCell("R$ " + item.getUnitPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())).toString(), Element.ALIGN_RIGHT, even));
            even = !even;
        }
        return table;
    }

    public byte[] generateQuotationPdf(Quotation quotation) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter writer = PdfWriter.getInstance(document, baos);
            writer.setPageEvent(new FooterPageEvent(quotation.getTenant()));
            document.open();

            addCompanyHeader(document, quotation.getTenant());

            document.add(new Paragraph("Orçamento", FONT_TITULO));
            document.add(new Paragraph("Número do Orçamento: " + quotation.getId(), FONT_BOLD));
            document.add(new Paragraph("Data de Emissão: " + quotation.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), FONT_NORMAL));
            document.add(new Paragraph(" "));

            addClientAndVehicleInfo(document, quotation);
            document.add(new Paragraph(" "));

            Paragraph servicesTitle = new Paragraph("Serviços Propostos", FONT_SUBTITULO);
            servicesTitle.setSpacingAfter(10f);
            document.add(servicesTitle);
            document.add(createQuotationServicesTable(quotation));
            document.add(new Paragraph(" "));

            Paragraph partsTitle = new Paragraph("Peças Orçadas", FONT_SUBTITULO);
            partsTitle.setSpacingAfter(10f);
            document.add(partsTitle);
            document.add(createQuotationPartsTable(quotation));
            document.add(new Paragraph(" "));

            Paragraph total = new Paragraph("Total: R$ " + quotation.getTotalCost(), FONT_TITULO);
            total.setAlignment(Element.ALIGN_RIGHT);
            document.add(total);

            addSignatureArea(document);

            document.close();
            return baos.toByteArray();
        } catch (DocumentException | IOException e) {
            throw new PdfGenerationException(e);
        }
    }

    private PdfPTable createQuotationServicesTable(Quotation quotation) {
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.addCell(createHeaderCell("Serviço", Element.ALIGN_LEFT));
        table.addCell(createHeaderCell("Qtd.", Element.ALIGN_CENTER));
        table.addCell(createHeaderCell("Custo (R$)", Element.ALIGN_RIGHT));
        table.addCell(createHeaderCell("Total (R$)", Element.ALIGN_RIGHT));

        boolean even = false;
        for (QuotationServiceItem item : quotation.getServiceItems()) {
            table.addCell(createDataCell(item.getRepairService().getName(), Element.ALIGN_LEFT, even));
            table.addCell(createDataCell(item.getQuantity().toString(), Element.ALIGN_CENTER, even));
            table.addCell(createDataCell("R$ " + item.getServiceCost().toString(), Element.ALIGN_RIGHT, even));
            table.addCell(createDataCell("R$ " + item.getServiceCost().multiply(java.math.BigDecimal.valueOf(item.getQuantity())).toString(), Element.ALIGN_RIGHT, even));
            even = !even;
        }
        return table;
    }

    private PdfPTable createQuotationPartsTable(Quotation quotation) {
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.addCell(createHeaderCell("Peça", Element.ALIGN_LEFT));
        table.addCell(createHeaderCell("Qtd.", Element.ALIGN_CENTER));
        table.addCell(createHeaderCell("Preço Unit. (R$)", Element.ALIGN_RIGHT));
        table.addCell(createHeaderCell("Total (R$)", Element.ALIGN_RIGHT));

        boolean even = false;
        for (QuotationPartItem item : quotation.getPartItems()) {
            table.addCell(createDataCell(item.getPart().getName(), Element.ALIGN_LEFT, even));
            table.addCell(createDataCell(item.getQuantity().toString(), Element.ALIGN_CENTER, even));
            table.addCell(createDataCell("R$ " + item.getUnitPrice().toString(), Element.ALIGN_RIGHT, even));
            table.addCell(createDataCell("R$ " + item.getUnitPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())).toString(), Element.ALIGN_RIGHT, even));
            even = !even;
        }
        return table;
    }

    private void addSignatureArea(Document document) throws DocumentException {
        document.add(new Paragraph(" "));
        document.add(new Paragraph(" "));
        document.add(new Paragraph(" "));
        PdfPTable signatureTable = new PdfPTable(2);
        signatureTable.setWidthPercentage(100);

        PdfPCell companySignatureCell = new PdfPCell(new Phrase("_________________________\nAssinatura do Responsável", FONT_NORMAL));
        companySignatureCell.setBorder(Rectangle.NO_BORDER);
        companySignatureCell.setHorizontalAlignment(Element.ALIGN_CENTER);

        PdfPCell clientSignatureCell = new PdfPCell(new Phrase("_________________________\nAssinatura do Cliente", FONT_NORMAL));
        clientSignatureCell.setBorder(Rectangle.NO_BORDER);
        clientSignatureCell.setHorizontalAlignment(Element.ALIGN_CENTER);

        signatureTable.addCell(companySignatureCell);
        signatureTable.addCell(clientSignatureCell);
        document.add(signatureTable);
    }

    public byte[] generateServiceOrderPdf(ServiceOrder serviceOrder) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter writer = PdfWriter.getInstance(document, baos);
            writer.setPageEvent(new FooterPageEvent(serviceOrder.getTenant()));
            document.open();

            addCompanyHeader(document, serviceOrder.getTenant());

            document.add(new Paragraph("Ordem de Serviço", FONT_TITULO));
            document.add(new Paragraph("ID da Ordem: " + serviceOrder.getId(), FONT_BOLD));
            document.add(new Paragraph("Status: " + serviceOrder.getStatus().name(), FONT_BOLD));
            document.add(new Paragraph("Data de Entrada: " + serviceOrder.getEntryDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), FONT_NORMAL));
            if (serviceOrder.getExitDate() != null) {
                document.add(new Paragraph("Data de Saída: " + serviceOrder.getExitDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), FONT_NORMAL));
            }
            document.add(new Paragraph(" "));

            addServiceOrderClientAndVehicleInfo(document, serviceOrder);
            document.add(new Paragraph(" "));

            Paragraph servicesTitle = new Paragraph("Serviços Executados", FONT_SUBTITULO);
            servicesTitle.setSpacingAfter(10f);
            document.add(servicesTitle);
            document.add(createServiceOrderServicesTable(serviceOrder));
            document.add(new Paragraph(" "));

            Paragraph partsTitle = new Paragraph("Peças Utilizadas", FONT_SUBTITULO);
            partsTitle.setSpacingAfter(10f);
            document.add(partsTitle);
            document.add(createServiceOrderPartsTable(serviceOrder));
            document.add(new Paragraph(" "));

            Paragraph employeesTitle = new Paragraph("Equipe e Mão de Obra", FONT_SUBTITULO);
            employeesTitle.setSpacingAfter(10f);
            document.add(employeesTitle);
            document.add(createServiceOrderEmployeesTable(serviceOrder));
            document.add(new Paragraph(" "));

            Paragraph total = new Paragraph("Custo Total: R$ " + serviceOrder.getTotalCost(), FONT_TITULO);
            total.setAlignment(Element.ALIGN_RIGHT);
            document.add(total);

            addSignatureArea(document);

            document.close();
            return baos.toByteArray();
        } catch (DocumentException | IOException e) {
            throw new PdfGenerationException(e);
        }
    }

    private PdfPTable createServiceOrderServicesTable(ServiceOrder serviceOrder) {
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.addCell(createHeaderCell("Serviço", Element.ALIGN_LEFT));
        table.addCell(createHeaderCell("Qtd.", Element.ALIGN_CENTER));
        table.addCell(createHeaderCell("Valor Unit. (R$)", Element.ALIGN_RIGHT));
        table.addCell(createHeaderCell("Total (R$)", Element.ALIGN_RIGHT));

        boolean even = false;
        if (serviceOrder.getServiceItems() != null) {
            for (ServiceOrderServiceItem item : serviceOrder.getServiceItems()) {
                table.addCell(createDataCell(item.getRepairService().getName(), Element.ALIGN_LEFT, even));
                table.addCell(createDataCell(String.valueOf(item.getQuantity()), Element.ALIGN_CENTER, even));
                table.addCell(createDataCell("R$ " + item.getServiceCost().toString(), Element.ALIGN_RIGHT, even));
                BigDecimal total = item.getServiceCost().multiply(BigDecimal.valueOf(item.getQuantity()));
                table.addCell(createDataCell("R$ " + total.toString(), Element.ALIGN_RIGHT, even));
                even = !even;
            }
        }
        return table;
    }

    private PdfPTable createServiceOrderPartsTable(ServiceOrder serviceOrder) {
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.addCell(createHeaderCell("Peça", Element.ALIGN_LEFT));
        table.addCell(createHeaderCell("Qtd.", Element.ALIGN_CENTER));
        table.addCell(createHeaderCell("Preço Unit. (R$)", Element.ALIGN_RIGHT));
        table.addCell(createHeaderCell("Total (R$)", Element.ALIGN_RIGHT));

        boolean even = false;
        if (serviceOrder.getPartItems() != null) {
            for (ServiceOrderPartItem item : serviceOrder.getPartItems()) {
                table.addCell(createDataCell(item.getPart().getName(), Element.ALIGN_LEFT, even));
                table.addCell(createDataCell(item.getQuantity().toString(), Element.ALIGN_CENTER, even));
                table.addCell(createDataCell("R$ " + item.getUnitPrice().toString(), Element.ALIGN_RIGHT, even));
                table.addCell(createDataCell("R$ " + item.getUnitPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())).toString(), Element.ALIGN_RIGHT, even));
                even = !even;
            }
        }
        return table;
    }

    private PdfPTable createServiceOrderEmployeesTable(ServiceOrder serviceOrder) {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.addCell(createHeaderCell("Funcionário", Element.ALIGN_LEFT));
        table.addCell(createHeaderCell("% Comissão", Element.ALIGN_CENTER));

        boolean even = false;
        if (serviceOrder.getServiceItems() != null) {
            for (ServiceOrderServiceItem item : serviceOrder.getServiceItems()) {
                table.addCell(createDataCell(item.getEmployee().getName(), Element.ALIGN_LEFT, even));
                table.addCell(createDataCell(item.getEmployee().getCommissionPercentage() != null ? item.getEmployee().getCommissionPercentage().toString() + "%" : "N/A", Element.ALIGN_CENTER, even));
                even = !even;
            }
        }
        return table;
    }
}
