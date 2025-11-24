package com.mechtech.MyMechanic.service;

import com.mechtech.MyMechanic.entity.Invoice;
import com.mechtech.MyMechanic.entity.ServiceOrder;
import com.mechtech.MyMechanic.exception.BusinessRuleException;
import com.mechtech.MyMechanic.repository.InvoiceRepository;
import com.mechtech.MyMechanic.repository.projection.InvoiceProjection;
import com.mechtech.MyMechanic.repository.specification.InvoiceSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class InvoiceService extends AbstractTenantAwareService<Invoice, Long, InvoiceRepository> {

    private final ServiceOrderService serviceOrderService;
    private final PdfGenerationService pdfGenerationService;
    private final ProjectionFactory projectionFactory;

    public InvoiceService(InvoiceRepository repository, ServiceOrderService serviceOrderService, PdfGenerationService pdfGenerationService, ProjectionFactory projectionFactory) {
        super(repository);
        this.serviceOrderService = serviceOrderService;
        this.pdfGenerationService = pdfGenerationService;
        this.projectionFactory = projectionFactory;
    }

    @Transactional
    public Invoice createFromServiceOrder(Long serviceOrderId) {
        ServiceOrder serviceOrder = serviceOrderService.findById(serviceOrderId);
        if (serviceOrder.getStatus() != ServiceOrder.ServiceOrderStatus.COMPLETO) {
            throw new BusinessRuleException("A Ordem de Serviço precisa estar com o status 'COMPLETO' para gerar uma fatura.");
        }

        if (repository.existsByServiceOrderId(serviceOrderId)) {
            throw new BusinessRuleException("Já existe uma fatura para esta Ordem de Serviço.");
        }
        if (serviceOrder.getTotalCost() == null) {
            serviceOrder.calculateTotalCost();
        }

        Invoice invoice = new Invoice();
        invoice.setTenantId(serviceOrder.getTenantId());
        invoice.setServiceOrder(serviceOrder);
        invoice.setTotalAmount(serviceOrder.getTotalCost());
        invoice.setIssueDate(LocalDateTime.now());
        invoice.setPaymentStatus(Invoice.PaymentStatus.PENDING);

        // Gerar um número para a fatura (ex: OS-10-20250915)
        String invoiceNumber = String.format("OS-%d-%s",
                serviceOrder.getId(),
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")));
        invoice.setInvoiceNumber(invoiceNumber);

        return repository.save(invoice);
    }

    @Transactional(readOnly = true)
    public Page<InvoiceProjection> findAll(Pageable pageable) {
        Page<Invoice> invoicesPage = repository.findAll(pageable);
        return invoicesPage.map(invoice -> projectionFactory.createProjection(InvoiceProjection.class, invoice));
    }

    @Transactional(readOnly = true)
    public Page<InvoiceProjection> search(String searchTerm, Pageable pageable) {
        Specification<Invoice> spec = InvoiceSpecification.search(searchTerm);
        Page<Invoice> invoicesPage = repository.findAll(spec, pageable);
        return invoicesPage.map(invoice -> projectionFactory.createProjection(InvoiceProjection.class, invoice));
    }

    @Transactional(readOnly = true)
    public byte[] getInvoiceAsPdf(Long invoiceId) {
        Invoice invoice = findById(invoiceId);
        return pdfGenerationService.generateInvoicePdf(invoice);
    }

    @Transactional
    public Invoice updatePaymentStatus(Long invoiceId, String newStatusStr) {
        Invoice invoice = findById(invoiceId);
        Invoice.PaymentStatus newStatus;
        try {
            newStatus = Invoice.PaymentStatus.valueOf(newStatusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleException("Status de pagamento inválido: " + newStatusStr);
        }

        if (newStatus == Invoice.PaymentStatus.PAID && invoice.getPaymentDate() == null) {
            // Se está a ser marcada como PAGA e ainda não tem data, define a data atual
            invoice.setPaymentDate(LocalDateTime.now());
        } else if (newStatus != Invoice.PaymentStatus.PAID) {
            // Se o status for alterado para qualquer coisa que não seja PAGO, remove a data.
            invoice.setPaymentDate(null);
        }
        invoice.setPaymentStatus(newStatus);
        return repository.save(invoice);
    }
}
