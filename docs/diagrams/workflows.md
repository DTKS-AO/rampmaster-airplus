# System Workflows

## 1. Report Creation Flow

```mermaid
graph TD
    A[Start Report] --> B[Step 1: Info Geral]
    B --> C[Step 2: Selecionar Funcionários]
    C --> D[Step 3: Upload Fotos]
    D --> E[Step 4: Assinaturas]
    E --> F[Step 5: Revisão]
    F --> G{Aprovado?}
    G -->|Sim| H[Gerar PDF]
    G -->|Não| F
    H --> I[Publicar]
    I --> J[Notificar Cliente]
    J --> K[Fim]

    subgraph "Step 1: Info Geral"
        B1[Selecionar Aeronave]
        B2[Tipo de Serviço]
        B3[Data/Hora]
        B4[Turno Auto/Manual]
    end

    subgraph "Step 2: Funcionários"
        C1[Lista de Técnicos]
        C2[Marcar Ausências]
        C3[Justificativas]
    end

    subgraph "Step 3: Fotos"
        D1[Foto Antes]
        D2[Foto Depois]
        D3[Upload Supabase]
    end

    subgraph "Step 4: Assinaturas"
        E1[Assinatura Técnico]
        E2[Assinatura Supervisor]
        E3[Assinatura Cliente]
    end
```

## 2. Role Hierarchy and Permissions

```mermaid
graph TD
    A[Super Admin] --> B[Gestor]
    B --> C[Supervisor]
    C --> D[Técnico]
    C --> E[Auxiliar]
    A --> F[Cliente]

    subgraph "Super Admin Permissions"
        A1[user.*]
        A2[client.*]
        A3[system.*]
    end

    subgraph "Gestor Permissions"
        B1[employee.*]
        B2[aircraft.*]
        B3[report.*]
    end

    subgraph "Supervisor Permissions"
        C1[turno.write]
        C2[report.write]
        C3[team.manage]
    end

    subgraph "Técnico Permissions"
        D1[report.create]
        D2[photos.upload]
    end

    subgraph "Cliente Permissions"
        F1[reports.view.own]
        F2[aircraft.view.own]
        F3[analytics.basic]
    end
```

## 3. Frontend Component Structure

```mermaid
graph TD
    A[App.tsx] --> B[MainLayout]
    B --> C[Header]
    B --> D[Content]
    B --> E[Footer]

    C --> C1[Logo]
    C --> C2[Navigation]
    C --> C3[UserMenu]

    D --> D1[Pages]
    D --> D2[Components]

    D1 --> P1[Dashboard]
    D1 --> P2[Aircraft]
    D1 --> P3[Employees]
    D1 --> P4[Reports]
    D1 --> P5[Settings]

    D2 --> COM1[UI Components]
    D2 --> COM2[Forms]
    D2 --> COM3[Tables]

    subgraph "UI Components"
        COM1 --> UI1[Button]
        COM1 --> UI2[Input]
        COM1 --> UI3[Card]
        COM1 --> UI4[Dialog]
    end

    subgraph "Data Flow"
        DF1[Supabase Client]
        DF2[React Query]
        DF3[Local State]
        DF4[Context]
    end
```

## 4. Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant S as Supabase Auth
    participant D as Database

    U->>F: Access App
    F->>S: Check Session
    alt Has Valid Session
        S->>F: Return User
        F->>D: Fetch Profile
        D->>F: Return Profile
        F->>U: Show Dashboard
    else No Session
        S->>F: No Session
        F->>U: Show Login
        U->>F: Enter Credentials
        F->>S: Login Request
        S->>F: Return JWT
        F->>D: Fetch Profile
        D->>F: Return Profile
        F->>U: Show Dashboard
    end
```

## 5. Data Flow and State Management

```mermaid
graph TD
    A[Frontend] --> B[React Query]
    B --> C[Supabase Client]
    C --> D[Database]

    subgraph "Cache Layer"
        B1[Query Cache]
        B2[Mutation Cache]
        B3[Infinite Queries]
    end

    subgraph "State Management"
        S1[Local State]
        S2[Context]
        S3[URL State]
    end

    subgraph "Data Operations"
        O1[Create]
        O2[Read]
        O3[Update]
        O4[Delete]
    end

    O1 --> |Trigger|AU[Audit Log]
    O3 --> |Trigger|AU
    O4 --> |Trigger|AU
```

## 6. PDF Generation Workflow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant P as PDF Generator
    participant S as Storage

    U->>F: Request PDF
    F->>F: Validate Data
    F->>P: Generate PDF
    P->>P: Add Watermark
    P->>P: Add Metadata
    P->>S: Store PDF
    S->>F: Return URL
    F->>U: Download Link
```